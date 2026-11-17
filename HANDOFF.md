# Being Found 8.3.9: QA foundation

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
python3 menu_check.py
python3 test_prop_states.py
python3 e2e_sync.py 390x844
python3 test_later.py 390x844
python3 dele_check.py
python3 visit_check.py
```
Python Playwright is required. Browser executable auto-detects `google-chrome` or `chromium`; override with `BF_CHROME`. Screenshots go to `qa-artifacts/` by default. Legacy test snapshots from `e2e_sync.py` and `test_prop_states.py` are written to the repository root and ignored by git.

## Not yet checked
Sound, real devices, screen readers, other residents at the stove, the hint line under the story card in Dele's flat on phones.

## Notes
- CSS is a specificity war with `!important`; `.layout` is a flex item, so fixed heights need `flex:none!important`.
- `body.cl-route` (guided classroom) withholds the world readout on purpose.

## The rig files
The hosted page cannot serve `.glb`, so `assets/*_rig.glb` ship as `assets/*_rig.glb.b64.txt`. Restore with
`base64 -d noor_rig.glb.b64.txt > noor_rig.glb`. The game does not load them; they only regenerate the sprite atlases.
Python test files ship as `.py.txt` and `.gitignore` as `gitignore.txt`: rename them back.

## Chat handoffs
The user wants proactive advice when a new development chat would help. Recommend one after a significant completed milestone or when long context threatens accuracy, **not** automatically each iteration. Before recommending, record the current branch and commit, test evidence, unresolved problems and next action here and in `SAVE_NOTES.md`. Always read this file first in the next chat.
