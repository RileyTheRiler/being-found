# Being Found — current handoff

## 8.5.3 guided front-door reduced-motion fade — focused PR #15 (2026-11-21 UTC)

- Baseline for this change is **merged PR #14**, GitHub `main` `e8731d255b0446e7c9fac7748ce1772ff2c7be2e` (lying-bed renderer and its eight viewport/role screenshots). Vercel production `dpl_2DcfKEwopkKWn6yiv6y8qtZsmoeS` READY and `being-found.vercel.app` alias verified for this SHA. Main [Actions 44866602780](https://github.com/RileyTheRiler/being-found/actions/runs/44866602780) was still completing at writing; post-merge receipt must record its eventual conclusion.
- Draft [PR #15](https://github.com/RileyTheRiler/being-found/pull/15) independently reproduces a presentation-only `fade()` wait on the *real guided Noor front-door action* with browser reduced motion: initial red [Actions 44866142650](https://github.com/RileyTheRiler/being-found/actions/runs/44866142650) observed midpoint **0.755s** and completion **1.855s**.
- Focused correction to `src/index.html`: when `calm()` indicates reduced motion, skip only the transitional overlay/timers and invoke the scene-change callbacks directly; ordinary motion retains the exact 900/2300 multiplied pacing timers. The actual browser check [Actions 44866286975](https://github.com/RileyTheRiler/being-found/actions/runs/44866286975) observed reduced midpoint **0.039s**, completion **0.046s**, and ordinary midpoint **0.836s**, completion **1.936s**. No dice/capability mechanic, mood-speed penalty, consent, silence, authored choice, save, or optional Rooms behavior changed.
- `qa_reduced_motion_fade.py` checks the guided front-door path under reduced/normal motion and continued guided route; included in `qa_all.py`, `.github/workflows/quality.yml` and a dedicated audit workflow. **PR #15 is not production** pending final exact-head complete QA, Vercel preview, review, merge and post-merge production/Actions checks.
- Full classroom pilot, physical iPad, independent assistive-technology testing and lived-experience validation remain outstanding. Classroom preview only.

## 8.5.3 bed/lying presentation — focused PR #14 (2026-11-20 / 21 UTC)

**Verified production baseline:** `main` at `dfe124e6e525bd325f60c7a05eb6e62d5f6404ac` from merged PR #13. Exact post-merge [Actions 44689935919](https://github.com/RileyTheRiler/being-found/actions/runs/44689935919) passed 43/43 steps; Vercel production `dpl_KfVvQYwgHudy7BJuFpEzkgBVMQxv` was READY with that source SHA and `being-found.vercel.app` alias. PR #13's final release comment supersedes older "review pending" records below.

**Current separate work:** [draft PR #14](https://github.com/RileyTheRiler/being-found/pull/14), branch `fix/8.5.3-lying-bed-presentation`. The new browser test `qa_lying_bed.py` first **failed** on uncorrected main-derived renderer ([Actions 44864860243](https://github.com/RileyTheRiler/being-found/actions/runs/44864860243)): the playable lying actor was drawn as an upright sprite and there was no pillow head. In `room.js`, the replacement renderer also excluded lying NPCs. The focused correction uses existing `BFArt.drawHead` with pillows/duvet depth ordering, and does not draw the lying playable resident a second time in the standing actor pass. Eight browser cases (player and NPC on phone, tablet portrait, tablet landscape, desktop) record screenshots and head/upright assertions. Existing sofa, walk, accessibility, save and guided consent tests remain required. **The branch is not production and must not merge until exact-head full Actions, visual image review and Vercel preview validation pass.**

Reduced-motion generic `fade()` uses `900*pacing().transition` and `2300*pacing().transition`; its identified call sites belong to native phase changes, visits and street entries/exits. A guided-route delay is **not yet reproduced**, so no speculative global timing change was made. Audit independently in a dedicated reduced-motion PR if browser evidence establishes unwanted waits. Seated/NPC rise visual scrutiny and physical iPad/AT/lived-experience/pilot work remain outstanding. Classroom preview only.

## 8.5.3 reduced-motion Walt transcript — focused review branch (2026-11-19 / 20 UTC)

**Verified source before this branch:** `main` at `728fad2c2e07f79686becf7118362aa4412508e9` (PR #12 merged). [Post-merge Actions 44681370289](https://github.com/RileyTheRiler/being-found/actions/runs/44681370289) succeeded with 42 quality steps. Vercel production `dpl_7k6FrCMmUTyoB3hjmNKhyc4Jdn5b` was READY at the same GitHub SHA and assigned to the Being Found project. The older handoff below predates PR #12 and is historical.

**Unreleased review scope:** `fix/8.5.3-reduced-motion-walt-dwell` removes presentation-only line-by-line transcript dwell in Walt's encounter under `prefers-reduced-motion: reduce`. Existing user-controlled Walt communication pauses, choices, silence, voluntary skip, and non-reduced reading pace remain unchanged. The added `qa_reduced_motion_walt.py` tests a real Noor → Dele-leaves-note → Walt guided path at phone and desktop reduced motion, and ordinary desktop pacing, including absence of forced Dele-room entry. It runs in both `qa_all.py` and GitHub Actions. Do not infer that this branch has passed build/tests, merged or deployed until exact-head CI and preview verification. **All 8.5.2 safety and 8.5.3 focus/axe protections remain release gates.**

Next: run and inspect the full PR Actions, verify exact-head Vercel preview, merge only when green, verify post-merge main Actions/production exact SHA; subsequently inspect seated/lying NPCs in a separate art-focused PR. Physical devices, VoiceOver/TalkBack, paid lived-experience review and participant pilot remain outstanding. Classroom status: **preview, not approved**.


## 8.5.3 tablet Guide follow-up — focused branch (2026-11-19 / 20 UTC)

**Latest verified released `main`:** `2cedf2db031186aa04d37973ee957a893b44d314`, PR #11 merged. [Main GitHub Actions 44678112076](https://github.com/RileyTheRiler/being-found/actions/runs/44678112076) **passed all 41 steps**. Vercel production deployment `dpl_AZuqff3xLua16aH4TZCDXpNMUfib` was READY and `being-found.vercel.app` assigned with the **same SHA**. Version remains 8.5.3 classroom preview, **not pilot-approved**.

**Unreleased follow-up:** branch `fix/8.5.3-tablet-guide-targets` from that main commit; review in [PR #12](https://github.com/RileyTheRiler/being-found/pull/12) and inspect its current head before citing a subsequent deployment. Scope: `src/index.html` adds the omitted 700–899px tablet-portrait case to the *existing* `syncGuide()` owner, moving the active Guide into the reading dock rather than leaving it fixed over the illustration. `ui.js` now treats a docked portrait Guide as always visible rather than applying the phone-only closed/toggle state; `a11y_853.css` resets its position inside that dock, removes the redundant tablet toggle and enforces at least 44px button dimensions. The first new CI run exposed the previous hidden-Guide conflict; subsequent code now handles it rather than merely relaxing the check. New `qa_tablet_guide.py` validates portrait/landscape/phone resize, non-overlap, focus restoration and target size; wired into `qa_all.py` and GitHub Actions. No story, consent, audio, save, animation or dice logic changes. Automated browser testing is **pending** until the branch workflow passes. Do not merge a failing PR. Physical iPad/phone and screen-reader testing still required.

## 8.5.3 accessibility — focused PR #11 (2026-11-19)

**Source branch:** `feat/8.5.3-title-focus-axe`, based on `main` at `9562ce84fd10cbcb41c496bcdbeca0dcd47e4402`. See [PR #11](https://github.com/RileyTheRiler/being-found/pull/11) and check its current head/checks before merging. This entry records the implementation scope and validation requirements; it is **not** proof of a production release.

- The full-screen title is now a named modal with initial focus, background isolation, Tab/Shift+Tab containment, and focus release when opening Guided Story. Title behavior is separate from the consent mechanics.
- Pinned `axe-core@4.14.1` is bundled for **test execution only** (`npm ci`), not sent to the browser. CI and `qa_all.py` audit nine actual guided stages at 390×844 and 1440×900; any serious/critical automated violation fails. Complete JSON findings, including moderate/incomplete cases, are stored under `qa-artifacts/axe-8.5.3.json`.
- Axe-informed fixes: small-text contrast on title, chapter indicators, and Dele speaker labels; progress dots represented as labelled imagery; Show me / Head home accessible button name includes visible text.
- Safety boundary: 8.5.2 guided/pilot dice prohibition, heavy-action parity, speed parity, Dele consent/exits, v1 save history, Rooms mechanics and preview notice are unchanged; full pre-merge regression must pass. Keyboard and axe checks **do not** substitute for physical device, screen-reader, switch access, lived-experience or classroom review.
- Release gate: verify all GitHub quality steps for the exact PR head, the same SHA in Vercel preview metadata, merge with expected SHA only after review, then verify post-merge Actions and production Vercel commit/alias against the exact new `main` commit. The release-only production branch proposal remains unconfigured. Remaining 8.5.3 layout/pose/reduced-motion work is deferred to a separate reviewed change.

## 8.5.2 safety release — merged 2026-11-19

**Authoritative main release commit:** `989e2ebcc60362b7a38a646343fdff41333878ad`; [PR #3](https://github.com/RileyTheRiler/being-found/pull/3) merged from `feat/8.5.2b-consent-route`. The [reviewed branch CI run 44581670898](https://github.com/RileyTheRiler/being-found/actions/runs/44581670898) passed all 38 quality steps, including real Chrome automated playthroughs and prior animation regressions. Initial 8.5.2 production Vercel deployment `dpl_TSRKwixNzhL8vMZ1wq9kdqzDDdnk` was READY with `being-found.vercel.app` assigned and commit metadata matching `989e2eb`. Verify any later deployment against its exact commit before citing current production state.

**What shipped:** Guided Noor → Dele encounter → Walt (three chapters); no guided/pilot dice, heavy holds, mood-dependent movement penalties or punitive sealed styling; no immediate Dele revisit in guided/pilot or after a resident boundary; four recorded outcomes preserved in ordered localStorage history; existing Rooms dice mechanics retained and re-tested; visible semantic version plus build SHA; nonmodal preview notice; PR #9 sofa and physical animation preserved.

**Classroom status: not approved for a classroom pilot.** The fictional narrative and successful scripted testing do not establish lived-experience validity. Independent assistive-technology/keyboard testing, accessibility fixes, paid lived-experience review and formative participant validation are outstanding. The next release is **8.5.3 accessibility and layout**: title-dialog focus, axe-core serious violations, tablet portrait guide, actor pose/narrative consistency and reduced-motion waits. Refer to `CURRENT_STATE.md` and `RELEASE_PROCEDURE.md`. The release-only Vercel production-branch policy is proposed but **not configured**; `main` still deploys to production.

**Earlier dated sections below are historical technical records.** Their statements about PR #3 being a draft or initial releases being pending no longer describe the current branch.

## Sofa rig — final visual review notes (2026-11-18 / PR #9)

**Source of truth:** [PR #9](https://github.com/RileyTheRiler/being-found/pull/9), branch `feat/sofa-articulated-rig-20261118`, forked from verified `main` `7207a02`. Draft PR #3 (8.5.2B) remains isolated. Check the actual PR head and CI before merge; **do not infer production release from these notes**.

- **Geometry:** `sprite_rig.js` now uses the modeled atlas torso and jointed lower body with independent hips, knees, ankles and a small lifted foot repositioning step. The torso never shrinks to sit. The fixed floor correction addresses the legacy cushion/foot pivot mismatch. A taller static sofa was partly responsible; `room.js` proportionally lowers the existing sofa artwork around its floor contact (vertical factor 0.70). Only the upholstery lip repaints in front of knees; shins and shoes remain visible.
- **Visual evidence inspected:** Chrome-rendered desktop/phone/tablet sequences from GitHub Actions run [44460028092](https://github.com/RileyTheRiler/being-found/actions/runs/44460028092) show clearer vertical shins, feet beneath knees, an improved sofa size and forward/backward sit/rise. The preceding iterations had visible shin V-shapes and embedded hips, despite automated passes. **This is a bounded improvement, not photorealistic or professional rigging.** The modeled upper arms and raster/vector waist seam remain stiff. No change to phone, painting or cooking choreography in this PR.
- **QA:** Full 35-step quality workflow passed at `5bff80c0b1ab5aed2ec2a6204100833e519f3930`, before the final camera/prologue test-harness fixes. The separate `Character motion visual QA` workflow builds production output, captures the actual UI-driven Noor sofa sequence and verifies static same-rig poses for Tomas and Dele. When switching flats during visual QA, wait for the new atlas AND room camera; stale atlas results or a panned-away actor invalidate screenshots.
- **Release gate:** Rerun both workflows at the latest PR head, inspect Dele and Tomas images, keep PR draft until satisfactory, then verify Vercel production commit after merging. Existing narrative, saves, accessibility and 8.5.2B work must remain unchanged. Larger-scale joint/arm fidelity should come from a reproducible asset-authoring pipeline rather than piling on more geometry hacks.

## Articulated sofa prototype — branch verification pending (November 18, 2026)

**Base:** `7207a02b9b8defda975ff59e8cdd46840c58d69d` on `main`. **Branch:** `feat/sofa-articulated-rig-20261118`. This is a focused rendering change; the separate draft 8.5.2B PR #3 is untouched.

- **Architecture:** The modeled atlases provide no intermediate sit/rise frames or body-part bones at runtime. `ANIMATION_ARCHITECTURE.md` compares regeneration, vector rigging, runtime GLB and hybrid compositing and explains the limited selected approach.
- **Code:** `sprite_rig.js` renders the opaque modeled head/upper body plus two independently posed lower limbs driven by the authored seat/rise progress. Shoes remain planted while the knees move forward, hips descend and the torso leans transiently. `room.js` restores the shoe baseline rather than shrinking the entire model as it rises to the sofa anchor. The sofa front apron stays a separate depth layer.
- **QA:** `qa_seated_rig.py` exercises the real sofa/stove menus on desktop, phone and tablet, samples geometry, records screenshots, checks reduced motion and tests modeled Tomas/Dele. `qa_physical_actions.py` now expects the composite atlas source instead of the static seated cell. CI and `qa_all.py` include the new test.
- **Caution:** No build, CI, deployment or visual-quality conclusion is established by these edits alone. The vector pants may not exactly match the raster clothes, the sofa depth mask needs human screenshot review, NPCs retain the procedural fallback, and GLB asset regeneration has not occurred. Do not merge without a passing complete QA workflow and visual inspection. Keep gameplay/narrative unchanged.

## Staged physical actions — merged November 18, 2026

**Main code commit:** `26a785464fd793f11640d660c59e5d5027c395db`, [PR #8](https://github.com/RileyTheRiler/being-found/pull/8) merged. [GitHub Actions run 44451852112](https://github.com/RileyTheRiler/being-found/actions/runs/44451852112) passed **34/34 steps** on the reviewed branch, including actual desktop/mobile sofa, kitchen, easel and walking regressions. Vercel production deployment `dpl_A9gQnAApEGEMUTiQSRzrq5rHbjNM` reached **READY** on that merge commit with `being-found.vercel.app` assigned. Narratives, game results and draft 8.5.2B PR #3 remain unchanged.

- **Sofa enter:** The original action sets `S.sim.pose='sit'` at arrival. A new purely visual `BFStageSync.seatMotion` ties scene-space foot-position (floor 574 → cushion 516), body scale (100%→85%), seated atlas frame, and foreground sofa masking to a single eased part of the authored action. Repeated seat actions while already seated do not stand the actor up.
- **Sofa exit:** `BFNavigation.goTo` detects leaving the occupied sofa; the existing route stays queued but its feet remain near the sofa until a 0.82-second stand-up completes. `BFStageSync.seatMotion` and the model atlas change pose along the upward position/scale interpolation. Only then does ordinary walking begin. Cancels/reset/phase changes clear the transition. No separate story events or save state.
- **Cooking:** Rooted-flat cooking display time is at least 3.55 seconds for `fry/cook/two`; `BFStageSync.workMotion` supplies preparation, reach, work and return phases. The pan, a grounded utensil, and steam follow the same stage. The authored breakfast outcome still owns persistent pan/egg state.
- **Painting:** Rooted-flat `paint` display time is at least 3.7 seconds. Its brush moves during a dedicated stroke phase; temporary trial marks clear after the action, and permanent paint still depends on the authored `S.fx.painted` outcome. All other stages/narrative choices preserved.
- **Tests:** `qa_character_motion.py` now checks the gradual sofa descent. `qa_physical_actions.py` triggers the actual sofa/stove/easel menus on 1440×900 desktop and 390×844 phone, inspects per-stage positions and rendered frames, screenshots, completion and non-persistence of temporary props. Both run in local QA and CI. Pixel and stage-based tests do **not** prove natural-looking body motion.
- **Screenshot review and limitations:** Inspected captured sitting, rising, cooking and painting frames. Timing and staging are improved; the modeled seated legs still appear awkward against the cushion, and prop/body contact is approximate. These are enhanced staged illustrations, **not** articulated skeletal animations. Prioritize a dedicated sit/rise/prop rig rather than further layering sprite patches. Human visual review in the live app and real-device/assistive-technology checks remain outstanding.

## Phone interaction animation refinement — merged November 18, 2026

**Main code commit:** `8a9041b2b3d201a79dbd93246ba94dd1549ff5b9`, [PR #7](https://github.com/RileyTheRiler/being-found/pull/7) merged. [GitHub Actions run 44444265790](https://github.com/RileyTheRiler/being-found/actions/runs/44444265790) passed **33/33 steps** on the final reviewed branch head. Vercel production deployment `dpl_HN3Lt4nhjupVCPXVWaJrNPF8Eb42` reached **READY** on that merged commit and assigned `being-found.vercel.app`. Gameplay and narrative 8.5.2B work remains separate and unmerged.

- Root cause: phone `call` and `msg` actions inherited ~1-second default action durations. `sync.js` switched immediately to a single held-pose cell at 28% of the action and dropped to idle at completion. The phone on the table also disappeared and returned abruptly.
- `build.js`: set phone-specific minimum animation time (call 4.1 seconds, message 3.5 seconds) after authored state-specific routine durations are calculated. Other actions retain existing durations. No change to dialogue, effects, goals, save schema or input requirements.
- `sync.js`: deterministic, normalized reach → lift → use → lower → release phases, synchronized to the existing `S.sim.prog/S.sim.dur` action clock. `phoneMotion` exposes pose and whether the handset is physically on the table, without independent timers that might outlive a chapter.
- `sprite_rig.js`: transition between baked reach and phone atlas poses. The first full-body alpha crossfade made Noor semi-transparent in CI screenshots; it was corrected to an opaque primary sprite with a small *arm-only* transition overlay. `room.js` draws the table handset only during the correct phases. `art.js` applies matching arm/handset timing for the procedural fallback.
- `qa_phone_motion.py`: actual Noor phone action via UI on desktop 1440×900 and phone 390×844, ordered phase assertions, painted canvas hashes, screenshots, action duration and returned-to-table check. Added to `qa_all.py` and GitHub Actions.
- **Validation limits:** Automated desktop/mobile screenshot review confirmed reach, lift, hold, lower, and return frames and an opaque model during transitions. The baked atlas still holds the phone outward rather than fully to Noor's ear; truly realistic call/text poses require re-authoring the rig. This is a short *illustrative phone gesture*, not an actual-duration conversation. User visual confirmation and real-device/accessibility review remain outstanding.

## Visual walking and sofa seating correction — merged November 18, 2026

**Main code commit:** `db558064b49a0035af69cbbfcc37c2cfe1e0d7f4`, [PR #6](https://github.com/RileyTheRiler/being-found/pull/6) merged. Pre-merge GitHub Actions [run 44421600423](https://github.com/RileyTheRiler/being-found/actions/runs/44421600423) passed its full regression workflow. Vercel production deployment `dpl_J5HGWfAM5tkcnVYDFi3SDYgJtQuD` is `READY` on the code commit, with `being-found.vercel.app` assigned.

- **Diagnosed failure from the real visible sofa action:** physical `pose='sit'` and seated seat anchor activated while `BFStageSync.frame` still chose a standing/reach sprite during the start of the action. The model could appear inside the couch despite synthetic pose tests passing. `sprite_rig.js` now prioritizes seated pose over action timeline; `sync.js` no longer returns the standing/reach cell for a seated actor.
- **Seated geometry:** `navigation.js` seatY=516 rather than 561. `room.js` scales seated 2.5D actors to 85%, aligns visitor/NPC seating, and moves the sofa marker clear of the seated figure. This aligns the hips with the cushion, though the original prebaked sprite still has limited natural lower-leg geometry.
- **Walking:** Existing six-frame atlas walk steps switch direction and follow a more visible 92px step cycle plus small weight shift. `qa_character_motion.py` checks actual rendered RGBA pixel differences and samples 4 screenshots of a moving actor, not only internal state. Automated screenshots were inspected and show distinct leg positions.
- **Motion preference:** Default follows `prefers-reduced-motion`; View → Walking animation enables an explicit override for users who choose animation.
- **Validation limit:** Automated screenshots and pre-merge tests are not a substitute for user verification in their browser, or real-device/assistive-tech testing. Final seated feet geometry may benefit from a future dedicated rig redesign. Keep separate draft 8.5.2B behavior work isolated.

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

## 8.5.2B draft — consent-safe route and guided input gates (branch only)

**Work in progress** on `feat/8.5.2b-consent-route`; do not describe it as released or tested until its PR Actions run passes. Current main remains the verified 8.5.2A foundation with 8.5.1 gameplay.

- Dele encounter records explicit outcomes (`left_note`, `visitor_left`, `resident_ended`, `ended_without_account`). Every ended encounter in Guided Story now goes to Walt, not automatically into Dele's authored interior. Standalone Rooms keeps the authored day separately. Chapter cues become Noor 1/3, Dele 2/3, Walt 3/3.
- Guided dice disabled via `BFFlags`; one activation for heavy actions; state-dependent movement penalties removed for the guided policy in both movement paths; sealed actions remain tappable and are rendered without strike/lock imagery. Legacy free play is intended to retain its existing mechanics.
- `qa_consent_branches.py` and `qa_route_no_capability.py` added to CI and the local manifest; `qa_guided84.py` updated for deliberate route change.
- **Not complete:** pilot readiness, accessibility fixes, epilogue world-swap/hidden-fit redesign, narrative length review, lived-experience/assistive-technology review, full CI verification, and Vercel deployment.

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
