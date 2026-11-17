# Being Found 8.4.0: guided story, encounter-first pacing and reflection

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
- `SAVE_NOTES.md`: step-by-step log (Steps 1 to 11). `README.md`: project readme.

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
- Confirm the current Actions run before claiming this batch passed.

## Release 8.4.0 changes
- Guided chapter transitions are brief, nonblocking, and absent when reduced motion is requested. A polite text status announces the chapter without forcing a delay.
- The classroom route proceeds straight to Dele's door after the preceding bridge (Rooms retains the ordinary referral screen). His silence, boundaries and stated wishes remain central.
- Shorter bridges separate the encounter from the fictional authored day, avoiding the implication that the day illustrates something independently verified about Dele.
- The final exercise asks what is observed, what is inferred, and what is unknown. A source-linked Ratcliffe note stays collapsed until the learner chooses to read it.
- Added `qa_guided84.py` for two viewport guided-route checks, Dele's pause and voluntary departure, final reflection, responsive overflow and a motion-preference check.
- Verify the latest GitHub Actions run before reporting the full build and regression suite as passing.

## Next suggested work
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
