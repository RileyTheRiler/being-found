# Being Found 8.3.8 (work in progress)

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

`python3 e2e_sync.py 390x844 1024x1366`, `python3 test_later.py`, and `python3 test_prop_states.py`. They need Playwright for Python and Chrome at `/usr/bin/chromium`.

## Layers

- `src/index.html`: the pinned base game.
- `build.js`: applies the engine patches and links the overlay modules.
- `postbuild.js`: removes internal release labels and links the shell files.
- `shell.js`, `shell.css` (built as `bf83.*`): the 8.3 play screen shell and Reflect sheet.
- `phase2.css` (built as `bf835.css`): the attempt dialog in words.
- `phase3.css`, `phase3.js` (built as `bf837.*`): shared encounter styling and label cleanup.

See `SAVE_NOTES.md` for the step log.
