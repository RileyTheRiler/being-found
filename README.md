# Being Found 8.4.0 (guided narrative and phenomenological reflection)

Editable source for Being Found. This line continues from the 8.3.7 preview.

## Build

1. Install Node.js 20 or newer.
2. Run `npm run build` in this folder.
3. The browser game lands in `dist/`.

The build reads its version from `package.json` and writes relative paths, so `dist/` runs from any folder or host.

## Play locally

Run `python3 -m http.server 8000` inside `dist/`, then open http://localhost:8000.

## Deploy

Static site. Vercel uses the build command `npm run build` and the output directory `dist`.

## Tests

CI in [`.github/workflows/quality.yml`](.github/workflows/quality.yml) runs on pushes to `main` and pull requests. It builds the production site, serves `dist/`, and runs browser regressions.

Locally, install Python Playwright and use a Chrome/Chromium browser:

```sh
npm run build
python3 -m pip install playwright
python3 -m http.server 8770 --directory dist
```

In another terminal:

```sh
python3 qa_smoke.py                 # five viewport smoke suite
python3 qa_save_resume.py           # save, sandbox, reload, continue
python3 qa_focus.py                 # Reflect background isolation, keyboard focus and restoration
python3 qa_audio.py                 # soundtrack off by default, enable, volume and mute
python3 qa_flats_stove.py           # kitchen actions in every flat; Dele's phone hint
python3 qa_guided84.py              # guided narrative, Dele encounter, ending and reduced motion
python3 menu_check.py               # title, rooms, routes, continue
python3 e2e_sync.py 390x844 1024x1366
python3 test_later.py 390x844
python3 test_prop_states.py
python3 dele_check.py
python3 visit_check.py
```

Set `BF_CHROME` to an installed Chrome executable if auto-detection fails. `BF_TEST_URL` overrides the local URL, and `BF_TEST_ARTIFACTS` overrides the screenshot directory (default `qa-artifacts/`). Screenshot artifacts from CI are downloadable from the Actions run.

These are automated browser checks, **not** a substitute for real-device and assistive-technology testing.

## Layers

- `src/index.html`: the pinned base game.
- `build.js`: applies the engine patches and links the overlay modules.
- `postbuild.js`: removes internal release labels and links the shell files.
- `shell.js`, `shell.css` (built as `bf83.*`): the 8.3 play screen shell and Reflect sheet.
- `phase2.css` (built as `bf835.css`): the attempt dialog in words.
- `phase3.css`, `phase3.js` (built as `bf837.*`): shared encounter styling and label cleanup.

The 8.4 guided route keeps Noor → Dele encounter → authored Dele day → Walt →
reflection. It now meets Dele at his door first, marks chapter transitions without
locking input, and separates observed actions from unverified interpretations in the
ending. The Ratcliffe note is optional and appears after the reflection fields.

See `SAVE_NOTES.md` for the step log.
