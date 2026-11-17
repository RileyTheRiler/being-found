# Being Found 8.3.8: continue elsewhere

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
`menu_check.py`, `visit_check.py`, `dele_check.py` (in the project root; saved as `.py.txt` in the hosted copy, rename them),
plus `e2e_sync.py`, `test_later.py`, `test_prop_states.py`.

## Not yet checked
Sound, real devices, screen readers, other residents at the stove, the hint line under the story card in Dele's flat on phones.

## Notes
- CSS is a specificity war with `!important`; `.layout` is a flex item, so fixed heights need `flex:none!important`.
- `body.cl-route` (guided classroom) withholds the world readout on purpose.

## The rig files
The hosted page cannot serve `.glb`, so `assets/*_rig.glb` ship as `assets/*_rig.glb.b64.txt`. Restore with
`base64 -d noor_rig.glb.b64.txt > noor_rig.glb`. The game does not load them; they only regenerate the sprite atlases.
Python test files ship as `.py.txt` and `.gitignore` as `gitignore.txt`: rename them back.
