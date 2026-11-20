# Being Found 8.5.3 — classroom preview

**Classroom status:** Released as a preview, not approved for classroom use. Scripted QA is not lived-experience or independent assistive-technology validation. See `CURRENT_STATE.md` and `RELEASE_PROCEDURE.md`.


Editable source for Being Found. This line continues from the 8.3.7 preview.

## Build

1. Install Node.js 20 or newer.
2. Run `npm ci` to install the pinned axe-core test dependency.
3. Run `npm run build` in this folder.
4. The browser game lands in `dist/`.

The build reads its version from `package.json` and writes relative paths, so `dist/` runs from any folder or host.

## Play locally

Run `python3 -m http.server 8000` inside `dist/`, then open http://localhost:8000.

## Deploy

Static site. Vercel uses the build command `npm run build` and the output directory `dist`.

## Tests

CI in [`.github/workflows/quality.yml`](.github/workflows/quality.yml) runs on pushes to `main` and pull requests. It builds the production site, serves `dist/`, and runs browser regressions.

Locally, install Python Playwright and use a Chrome/Chromium browser:

```sh
npm ci
npm run build
python3 -m pip install playwright
python3 -m http.server 8770 --directory dist
```

In another terminal:

```sh
python3 qa_smoke.py                 # five viewport smoke suite
python3 qa_tablet_guide.py          # tablet-portrait Guide, rotation, focus and 44px controls
python3 qa_save_resume.py           # save, sandbox, reload, continue
python3 qa_focus.py                 # Reflect background isolation, keyboard focus and restoration
python3 qa_audio.py                 # soundtrack off by default, enable, volume and mute
python3 qa_flats_stove.py           # kitchen actions in every flat; Dele's phone hint
python3 qa_guided84.py              # guided narrative, Dele encounter, ending and reduced motion
python3 qa_access85.py              # keyboard guide, focus and reduced-motion scroll
python3 qa_title_focus.py           # title modal Tab/Shift+Tab and exit focus handoff
python3 qa_axe.py                   # nine guided states x phone/desktop, serious/critical gate
python3 qa_heavy_access.py          # keyboard/pointer heavy-action parity with story checks off
python3 qa_editorial.py             # source + production narrative wording guard
python3 qa_js_syntax.py            # parse source and generated JavaScript, catch early syntax errors
python3 qa_wren_ilse.py            # Wren/Ilse runtime editorial assertions on phone and desktop
python3 qa_remaining_scenes.py     # five other resident narratives, mobile and desktop
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

The 8.5.2 guided route keeps Noor → Dele encounter → Walt → reflection. The separate authored Dele day remains available from Rooms without being presented as Dele's disclosed experience. It now meets Dele at his door first, marks chapter transitions without
locking input, and separates observed actions from unverified interpretations in the
ending. The Ratcliffe note is optional and appears after the reflection fields.

The 8.4.1 Dele editorial pass removes categorical claims about depression and
makes variation and the scene's fictional status more explicit. See
`EDITORIAL_REVIEW.md` for the source audit and outstanding lived-experience review.

The 8.4.2 pass also revises Wren and Ilse to avoid universal diagnostic claims and
makes visitor consent explicit. The guided facilitator panel shows local-only
chapter timing, with no data sent or stored. See `CLASSROOM_PILOT.md` for a
human usability and pacing protocol; no pilot results exist yet.

See `SAVE_NOTES.md` for the step log.

8.4.3 revises Tomas, Mika, Walt, Ruth and Kai for subjectivity, clinical uncertainty and non-deterministic language. These are desk reviews, not lived-experience validation.

## Classroom pilot (8.4.4)

Use `CLASSROOM_PILOT.md` and `pilot/FACILITATOR_SHEET.md` for an independent first-time learner pilot. Blank anonymous recording template: `pilot/observations.csv`. Run `python3 pilot_summary.py --self-test` and then `python3 pilot_summary.py pilot/observations.csv` after entering real, consented observations. No pilot participants or results are included. `pilot/ACCESSIBILITY_CHECKLIST.md` lists manual device testing still needed.

## 8.5.1 verified implementation

- 8.5.0 implementation: `11023d8cd8bd844e2db9a040c7000586e161ee99`, [GitHub Actions 44266165147](https://github.com/RileyTheRiler/being-found/actions/runs/44266165147), 29/29 successful.
- 8.5.1 verified code: `c97946c35495f58fbd26e1bbf0dabce485831118`, [GitHub Actions 44269157774](https://github.com/RileyTheRiler/being-found/actions/runs/44269157774), 30/30 successful. Build, editorial, guided-route, five-viewports, save/resume, encounters, story checks and the new keyboard/pointer regressions pass.
- Gameplay remains fictional, not a clinical assessment or validated empathy simulation. Classroom pilot, compensated lived-experience editorial consultation and real TalkBack/VoiceOver/switch access tests have **not** occurred. A passing browser suite does not validate participant learning or live accessibility. Vercel deployment is unverified.

## 8.5.2A development foundation (not a gameplay release)

Read [DESIGN_GUARDRAILS.md](DESIGN_GUARDRAILS.md) before modifying the classroom route. A feature branch adds `flags.js`, a local-only override policy, fail-closed source loading, `qa_flags.js` and an explicit `qa_all.py` runner. The flags currently have **no gameplay call sites**. They do not yet disable dice or movement penalties. Use `npm run qa` for build plus all existing manifest tests, or `python3 qa_all.py --list` to inspect the test list. The existing GitHub Actions individual regression steps remain authoritative until the branch is verified and merged.

## 8.5.3 accessibility scope

[PR #11](https://github.com/RileyTheRiler/being-found/pull/11) addresses title keyboard focus, modal semantics, a pinned axe-core quality gate and five recurring automated accessibility findings. The audit writes detailed results (including moderate/incomplete findings) to `qa-artifacts/axe-8.5.3.json` in CI. The release is **still a classroom preview** and is not validated for assistive technology, real devices or lived experience. Inspect `main`, GitHub Actions, and Vercel metadata before asserting deployment; a successful preview build is not a production deployment.
