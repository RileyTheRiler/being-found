# Being Found 8.4.2: Wren / Ilse editorial review and classroom timing

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
python3 qa_editorial.py             # authored source and compiled text guard
python3 qa_wren_ilse.py            # runtime narrative and viewport assertions for both flats
python3 menu_check.py
python3 test_prop_states.py
python3 e2e_sync.py 390x844
python3 test_later.py 390x844
python3 dele_check.py
python3 visit_check.py
```
Python Playwright is required. Browser executable auto-detects `google-chrome` or `chromium`; override with `BF_CHROME`. Screenshots go to `qa-artifacts/` by default. Legacy test snapshots from `e2e_sync.py` and `test_prop_states.py` are written to the repository root and ignored by git.

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
- Added `qa_wren_ilse.py`, expanded `qa_editorial.py` and `qa_guided84.py` to cover scene phrasing, runtime content and local pacing. **Verify 8.4.2 GitHub Actions before claiming complete success.**
- **Baseline at start of this release:** 8.4.1 commit `265cd0db2cebdf360c1844f45384e1194ff0d5c1`, successful Actions run [44181478986](https://github.com/RileyTheRiler/being-found/actions/runs/44181478986) (24/24 steps).

## Verified 8.4.0 baseline for next chat
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
