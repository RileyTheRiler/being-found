# Being Found — current state

## 8.5.3 lying-pose review branch (2026-11-21 UTC)

- **Current verified public production:** PR #13 merged to `main` `dfe124e6e525bd325f60c7a05eb6e62d5f6404ac`; main [Actions run 44689935919](https://github.com/RileyTheRiler/being-found/actions/runs/44689935919) passed 43/43; Vercel `dpl_KfVvQYwgHudy7BJuFpEzkgBVMQxv` READY, production alias `being-found.vercel.app` and Git source SHA matched. PR #13 final release receipt overrides older pending-status notes in this document.
- **Unmerged draft [PR #14](https://github.com/RileyTheRiler/being-found/pull/14):** lying main resident and authored lying NPC shown under bed duvet with pillow-anchored existing rig head, no second upright sprite. New browser regression first failed in uncorrected build ([Actions 44864860243](https://github.com/RileyTheRiler/being-found/actions/runs/44864860243)); corrected branch is undergoing exact-head CI, multi-viewport screenshot review and preview verification. Do not claim merged or deployed from a PR preview.
- **Next independent audit:** reproduction of remaining `fade()` reduced-motion transition waits on the actual guided path; source timers alone are insufficient evidence. Then seated/rising NPC visuals and touch/keyboard/overlay/orientation accessibility. Maintain all 8.5.2/8.5.3 protections. Physical devices, assistive technology, compensated lived-experience review and human pilot remain incomplete. **Classroom preview only.**

## 8.5.3 follow-up verification (2026-11-19 / 20 UTC)

- The more recent [merged PR #12](https://github.com/RileyTheRiler/being-found/pull/12) supersedes the pre-merge status below. **Verified production main:** `728fad2c2e07f79686becf7118362aa4412508e9`. [Actions run 44681370289](https://github.com/RileyTheRiler/being-found/actions/runs/44681370289) succeeded, 42/42 quality steps. Vercel `dpl_7k6FrCMmUTyoB3hjmNKhyc4Jdn5b` READY in production, commit metadata matched exact main SHA. Tablet portrait Guide fixes are merged and automated-browser tested; physical iPad and screen-reader checks remain open.
- **Current focused review branch:** `fix/8.5.3-reduced-motion-walt-dwell`: Walt presentation-only transcript waits under `prefers-reduced-motion` removed, with phone/desktop reduced-motion and ordinary-motion browser regression `qa_reduced_motion_walt.py`. This branch is **not production** until its PR, full CI and Vercel are separately verified.
- **Classroom status:** preview only. Consent/exit, guided non-capability controls, title focus, axe, saving and Rooms must remain regression gates. Next independent tasks: seated/lying pose visual review and remaining touch/focus/orientation audit, with human-device/assistive-technology and compensated lived-experience review ahead of any classroom approval.


Updated 2026-11-19. Read `HANDOFF.md` first. Source of truth: GitHub `main`, not a previous review hash.

## Release

- Source/production version: **8.5.3 classroom preview**, not classroom-approved. [PR #11](https://github.com/RileyTheRiler/being-found/pull/11) merged as `2cedf2db031186aa04d37973ee957a893b44d314`; [post-merge Actions 44678112076](https://github.com/RileyTheRiler/being-found/actions/runs/44678112076) passed 41/41 steps and Vercel deployment `dpl_AZuqff3xLua16aH4TZCDXpNMUfib` was READY with `being-found.vercel.app` assigned at that exact SHA. A separate tablet Guide follow-up is on branch `fix/8.5.3-tablet-guide-targets`, not yet verified or deployed.
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
| Tablet guide, lying/seated NPCs, reduced-motion waits | Tablet portrait Guide fix in unverified review branch; others open | Regression for 820×1180 portrait, 1180×820 landscape, 390×844 return, target dimensions and Guide focus; no real-device/AT signoff |
| Same-place educational comparison of changed possibilities | Open — design decision | Prefer testing a second authored Noor day; do not add a new branch before design approval |
| Narrative accuracy and mandatory reading load | Open | 8.5.4 reproducible count, clinical and philosophical editorial pass |
| Pilot deterministic contexts and instrument | Open | 8.5.5 controlled allocation and anonymous scoring |
| Rendering architecture and upper-body rig | Partly fixed | PR #9 preserves sofa articulation; torso/leg seam, hand-to-phone choreography remain |
| Human accessibility, participant and lived-experience validation | Not verified | Required before claiming classroom readiness |

The complete 21 original plus nine delta-review findings are **not exhaustively audited individually here** because the full November 18 delta-review source file was not available in repository or current file search. Do not infer a 30-item fixed tally from this grouped table. Reconcile the original review item IDs when its full source is attached.

## Next action

Review and fully validate `fix/8.5.3-tablet-guide-targets`: new portrait-dock routing and Guide-target CSS, browser resize/geometry/focus test, prior 8.5.2 consent and all 8.5.3 regressions. Merge only after a green exact-head CI and verified Vercel preview. The production branch still tracks `main`, so after merge verify Actions, commit metadata and production alias again. Then address reduced-motion action waits and lying/seated NPC representation in separate changes. Real-device/screen-reader, paid lived-experience review and participant pilot remain mandatory before classroom approval.
