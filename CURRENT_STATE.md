# Being Found — current state

Updated 2026-11-19. Read `HANDOFF.md` first. Source of truth: GitHub `main`, not a previous review hash.

## Release

- Source version: **8.5.3 classroom preview** on focused [PR #11](https://github.com/RileyTheRiler/being-found/pull/11); not classroom-approved. At this document revision the latest independently verified production source was 8.5.2. Verify the current `main` and Vercel metadata against each other before citing a later public release.
- Safety PR: [#3](https://github.com/RileyTheRiler/being-found/pull/3), merged to main as `989e2ebcc60362b7a38a646343fdff41333878ad`.
- Branch validation: [GitHub Actions run 44581670898](https://github.com/RileyTheRiler/being-found/actions/runs/44581670898), **38/38 steps successful**.
- Initial production verification: Vercel `dpl_TSRKwixNzhL8vMZ1wq9kdqzDDdnk`, target production, READY, exact merge SHA and alias `being-found.vercel.app`. This is a historical release verification, not a claim about any subsequent deployment.
- Post-merge main workflow: [run 44583201971](https://github.com/RileyTheRiler/being-found/actions/runs/44583201971); check current result.
- Browser scope: automated headless Chrome checks at phone, tablet, and desktop viewports. **No independent physical-device, screen-reader, classroom, or lived-experience validation.**
- Vercel: feature branches produce preview deployments; `main` currently auto-promotes to production. A protected release-only production branch remains **proposed, not activated** (see `RELEASE_PROCEDURE.md`).

## Review findings — current verification status

| Finding group | Status | Evidence or remaining work |
| --- | --- | --- |
| Guided/pilot dice and heavy holds | Fixed by code and automated tests | `flags.js`, `dice.js`, guided route QA and flag tests |
| Guided/pilot mood-speed penalty | Fixed by code; browser/device parity only partly verified | Native navigation deterministic ±10% regression, isolated fixture; no human speed validation |
| Dele automatic entry after ending | Fixed by automated route QA | Guided Dele → Walt, no forced authored day |
| Dele boundaries and immediate revisit controls | Fixed by automated consent QA | All four outcomes checked, ending/summary/room controls gated |
| Dele outcome histories and save compatibility | Fixed by automated regression | Append-only chronological encounter history under existing v1 storage key |
| Neutral guided sealed styling, labels, three chapters | Fixed by scripted regression | Route and CSS checks |
| Old Rooms dice assertions | Fixed by regression | Real title Rooms → Noor → Go in route; dice Try remains tested |
| Version/commit stamp and preview notice | Fixed in build/code | Visible title metadata; Vercel deployment commit checked |
| Release-only Vercel production branch | Partly fixed | Documented release procedure; account-level production branch switch not configured |
| Title keyboard modal and axe-core serious/critical audit | Implemented on 8.5.3 PR #11, release gated | Title modal focus and 18 axe-core checkpoint audits (9 stages × 2 viewports); focus/contrast/ARIA/name corrections; verify PR/main CI and Vercel exact SHA; real assistive-tech and target-size review remain |
| Tablet guide, lying/seated NPCs, reduced-motion waits | Open | 8.5.3 layout, pose, duration work |
| Same-place educational comparison of changed possibilities | Open — design decision | Prefer testing a second authored Noor day; do not add a new branch before design approval |
| Narrative accuracy and mandatory reading load | Open | 8.5.4 reproducible count, clinical and philosophical editorial pass |
| Pilot deterministic contexts and instrument | Open | 8.5.5 controlled allocation and anonymous scoring |
| Rendering architecture and upper-body rig | Partly fixed | PR #9 preserves sofa articulation; torso/leg seam, hand-to-phone choreography remain |
| Human accessibility, participant and lived-experience validation | Not verified | Required before claiming classroom readiness |

The complete 21 original plus nine delta-review findings are **not exhaustively audited individually here** because the full November 18 delta-review source file was not available in repository or current file search. Do not infer a 30-item fixed tally from this grouped table. Reconcile the original review item IDs when its full source is attached.

## Next action

Complete the **8.5.3 accessibility gate** for [PR #11](https://github.com/RileyTheRiler/being-found/pull/11): require all existing 8.5.2 safety and browser regressions plus new title focus and axe-core checks at the exact PR head, then verify Vercel preview. Merge only after review; check post-merge `main` quality run and production deployment SHA/alias independently. Separate remaining target-size, tablet placement, lying/seated NPC and reduced-motion tasks into a reviewed follow-up. Keep the preview notice and consent restrictions. Do not start more character-animation work yet.
