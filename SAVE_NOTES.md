# Being Found 8.3.8: save notes

The hosted save page holds the playable build at its root and this full source under `source/`.

## Rebuild from the save

1. Copy every file under `source/` into one folder, keeping `src/` and `assets/`.
2. Copy the three `*_atlas.webp` files from the page's root `assets/` folder into the source `assets/` folder.
3. Rename `gitignore.txt` to `.gitignore`, and drop the `.txt` ending from the three `*.py.txt` test files.
4. Run `npm run build`.

The `.glb` rig files are optional. The game does not load them, and the build skips them when they are missing.

## Step log

Base: the 8.3.7 preview as uploaded on 16 November 2026.

- Step 1, done: `npm run build` works again. 8.3.7 called a missing `export-files.js`, which made the build command fail. The build now takes its version from `package.json`, writes relative paths, and tolerates missing `.glb` files. The three Playwright tests returned, updated for the "Try" button.
- Step 2, done: the sandbox shows its controls and its readout at every size. Phones get a "Tune the five variables" bar that opens the sheet, and Reflect, then "Five possibilities", opens the world readout. Tablets and laptops show the Tune panel, the room, and the readout together, each scrolling on its own. The five variables sit above the link rules. Changes: the last block of `shell.css`, and the "Five possibilities" action in `shell.js`. The old sandbox hack in `shell.js` never took effect and is gone.
- Step 3, done: small and sideways phones. On 375 by 667 and 360 by 640 screens the outcome, its tags, and both follow-up choices now fit, and the story area scrolls a new choice or answer into view once. Phones held sideways show the room on the left and the story on the right. The clipped "check-in" fragment at the scene corner is gone: `rebindBody` in `room.js` now removes every stale copy of the body button. Changes: the reveal logic in `shell.js`, the "small and sideways phones" block in `shell.css`, one line in `room.js`. The choice check passed at six screen sizes with no page errors. The three Playwright tests last ran after step 2.
- Step 4, done: Reflect. One Reflect button sits in the bottom-right corner of the room at every size, and the copy that drifted through the story card is gone. "Five possibilities" now opens the world readout everywhere it applies: the bottom sheet on phones, a side drawer on tablets and laptops. The guided classroom route withholds the readout on purpose, so that entry leaves the sheet there. Changes: `shell.js` and the last block of `shell.css`. All checks and the three Playwright tests passed on this build.
- Step 5, done: tablets and laptops. Story text on wide screens grew from 16 to 18 px, with larger choice buttons. The tablet portrait story card widened from 620 to 860 px. The laptop story column now holds a steady reading width (380 to 560 px), so very wide screens give the extra space to the room. Changes: the last block of `shell.css`.
- Step 6, done: the stove "T-pose". The sprite never held its arms out. The dark hob and the pan sat behind Noor's shoulders and read as arms, and the stove marker covered her head. Noor now stands beside the pan (`navigation.js`, stove anchor x 1158 to 1200), the hob is pale (`room.js`), and the stove marker sits over the pot (`room.js`, pin 1185 to 1140).
- Step 7, done: laptops and landscape tablets keep the world readout open under the story card, scrolling on its own, in every room outside the guided classroom route (which withholds the readout on purpose). "Five possibilities" in Reflect brings that panel to its top there; tablets in portrait still get the side drawer and phones the bottom sheet. Changes: the last block of `shell.css` and `openWorld` in `shell.js`.
- Step 8, done: the world readout scales up by a quarter on tablets and laptops, so its labels read at about 14.5 to 16 px beside the 18 px story text. One rule at the end of `shell.css`.
- Step 9: regrouped the menus. The title now offers the guided story (plus Continue after a save), Rooms, Sandbox and About (sources, the opening, sound). The Rooms menu groups its contents under Five flats, Four clients, Two encounters and Afterwards (epilogue, Compare). Back returns to the title when the title opened Rooms. Duplicate entries (sandbox card, guided story, sources, study terms inside Rooms) are hidden. Code lives in shell.js (regroupTitle, regroupRooms) and shell.css.
- Step 10: checked Dele's flat and the epilogue. Dele's encounter runs to the end and opens his authored day on phone and laptop. The epilogue had a real fault: at Noor's door the camera stayed on the living area, so Noor and the speech marker sat off screen and the visit could not start on a phone. `room.js` now follows the tenant during a visit in every flat, and a new visit clears any manual camera choice. `visit_check.py` confirms the marker is on screen and opens its gesture menu at all five flats on four screen sizes.
- Step 11: two small fixes. A marker that the scene frame would cut in half now moves fully inside it (`placePins` in `room.js`); this showed on Dele's phone marker on a phone. In the epilogue the visitor no longer borrows the tenant's sprite: `sprite_rig.js` steps aside during a visit, so the visitor draws in their own pink top beside the tenant.
