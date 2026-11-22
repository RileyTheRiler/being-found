# Being Found 8.5.4C — Leena scene-linked inspection (2026-11-22 UTC)

**Gameplay PR:** [#25](https://github.com/RileyTheRiler/being-found/pull/25) merged at `f3e2bd924f6c6176ed989d6591abb27b1b3237b7` from exact reviewed PR head `aa809be96d5b85278d86e942468709453cf82abf` (baseline main `1e4bea1d2bb619c84c3808de0db2d26e359c2c8c`). A four-file change in `leena.js`, `leena.css`, `leena_library_art.js`, `qa_leena.py`; no narrative or global game engine changes.

**Exact PR-head QA:** [quality Actions #45054232402](https://github.com/RileyTheRiler/being-found/actions/runs/45054232402) **completed success, 46/46 steps**; [reduced-motion #45054232374](https://github.com/RileyTheRiler/being-found/actions/runs/45054232374) **success**. Preview Vercel `dpl_4f1r7ciiEP94pqQeyE5ytzfBheM1` READY at identical head SHA.

**Visual evidence:** [QA artifact #14766672396](https://github.com/RileyTheRiler/being-found/actions/runs/45054232402/artifacts/14766672396): five viewport room screenshots (360×640, 390×844, 820×1180, 1180×820, 1440×900) and 15 object detail screenshots examined. Calendar, cart and private phone now use crops from the actual generated illustrated library, with an outline marking visual focus. No new obstructing overlay; normal phone dialog scrolling remains necessary. The phone still exposes no private message text. These are **illustrated close views**, not a walkable 3D scene.

**Post-merge deployment:** Vercel production `dpl_84iAyn7zGknaGBwe2s98Ci5moLqW` READY, target production, exact `githubCommitSha=f3e2bd924f6c6176ed989d6591abb27b1b3237b7`; a fresh alias lookup confirmed `being-found.vercel.app` points to this deployment. **Main quality:** Pending: post-merge main quality Actions #45055319374 was still running when this receipt was prepared. Do not label final release verified until it concludes successfully.

**Regressions and boundaries:** Leena controls support the same 44px nonspatial object list and visual targets, keyboard/focus, mobile heading, reduced motion, voluntary talk/refusal, independent dated recollections, replay, privacy and witness-aware debrief. The complete exact-head quality suite passed the Noor→Dele→Walt route, equal input effort, consent, saves, flats/visits, character animations, axe and other checks. No psychiatric narrative, clinical assumption, score or save schema was changed.

**Human evidence limits:** Fictional classroom **preview only**; independent compensated bipolar lived-experience review, physical TalkBack/VoiceOver/switch-access and formative participant testing have **not** occurred. `reviews/LEENA_REVIEW_PACKET.md` and empty `reviews/leena_feedback_log.csv` are preparation, not human findings. No validation or pilot approval claim.

**Next:** Finish and record the post-merge main Actions conclusion, then verify any subsequent documentation-only merge/production independently. Subsequent development should prioritize compensated independent review and real assistive-technology/formative testing before claiming classroom suitability.

---

# 8.5.4B Leena illustrated-library technical release receipt — 2026-11-22 UTC

**Gameplay merge:** [PR #23](https://github.com/RileyTheRiler/being-found/pull/23) merged to `main` at `50fb98c5114e7e0341a4d2bf844d33a6c03a77d3` from exact reviewed PR head `74239ff5ec6d46d38a9ed8e4d1a2f073d6793a02` (starting main `c42386eb7d632dcf3106e81e33879e29e92d679b`).

**Pre-merge technical gate:** [quality Actions #44991010450](https://github.com/RileyTheRiler/being-found/actions/runs/44991010450) **success, 46/46 steps** at the exact head; [reduced-motion #44991010382](https://github.com/RileyTheRiler/being-found/actions/runs/44991010382) **success**. Preview Vercel `dpl_4oNfPMf91QmBFoXrbBarXXGHS3xA` READY with matching `githubCommitSha`.

**Screenshot review:** [QA artifact #14742465897](https://github.com/RileyTheRiler/being-found/actions/runs/44991010450/artifacts/14742465897) captured 360×640, 390×844, 820×1180, 1180×820, and 1440×900. Compared scene/full-screen images side by side to [PR #19 screenshot artifact #14699018942](https://github.com/RileyTheRiler/being-found/actions/runs/44883737707/artifacts/14699018942). Leena's face remains visible, the calendar/cart/phone are illustrated and associated with separate controls, no blocking overlap; narrowest phone requires normal dialog scrolling to reach lower controls. Illustrations do not claim a fully navigable 3D library.

**Post-merge technical gate:** `main` quality Actions [#44991711719](https://github.com/RileyTheRiler/being-found/actions/runs/44991711719) **completed success, 46/46 job steps** at the exact merge SHA. Vercel production `dpl_9nDmzc2BVkbTBVgrRALHLqqLMPfi` READY, target production, `githubCommitSha=50fb98c5114e7e0341a4d2bf844d33a6c03a77d3`, public alias `being-found.vercel.app` verified pointing at this deployment. Post-merge quality and production release metadata are verified for this exact gameplay merge. Any later documentation-only commit must be verified separately.

**Implemented:** deterministic editable wide/mobile SVG library scene generated by `leena_library_art.js` during `postbuild.js`; clearly faced Leena, calendar/cart/phone, responsive hotspots, visited state, object-detail images, and equal nonspatial keyboard buttons. The actual browser suite covers Leena's observation vs communication vs inference debrief, voluntary disclosure, early leave/refusal, both independent dated recollections, replay, heading visibility, focus restoration, reduced motion and axe. **Unchanged:** Noor→Dele→Walt guided route, five flats, visits, global renderer, save schema, consent parity and character animations.

**Ethical and accessibility limits:** fictional classroom preview only; **not independently bipolar lived-experience validated or classroom-pilot approved**. `reviews/LEENA_REVIEW_PACKET.md` and `reviews/leena_feedback_log.csv` remain unfilled/preparatory. Paid independent bipolar lived-experience review, physical TalkBack, VoiceOver, switch access and formative participants remain pending. Older development-branch notes below are historical, not the live release record.

---

# Issue #20 visual appraisal and pending independent review

PR #19 baseline screenshot artifact `14699018942` shows a faceless CSS silhouette and detached controls over a flat bookshelf/window/desk. Decision: do **not** extend the global 2.5D renderer or hard-coded FLATS/VISITS for this optional vertical slice. Build a separate deterministic illustrated wide/mobile library source with recognizable facial features, clearly drawn cart/calendar/phone, anchored prop controls and an equally available nonspatial object list. Visual changes must be audited with real screenshots; passing programmatic overlap assertions alone is insufficient. Object details remain externally observable only; private phone content, psychiatric inference and the two dated voluntary recollections are unchanged. The independent paid bipolar lived-experience review and physical assistive-technology review are **still outstanding**. The prepared packet and CSV are not evidence of reviewer consent or results.

---

# Post-merge Leena editorial status — 8.5.4 (2026-11-21 UTC)

**Merged gameplay PR:** [#19](https://github.com/RileyTheRiler/being-found/pull/19), code merge `f0d0b888405faabfdf4f9f1f26f1cb339aa08496` (after PR #18 `8f0463ad9c383fb1aaf0ced7fd81e63ba7e1686a`). Source-checked `main` at exactly `f0d0b888405faabfdf4f9f1f26f1cb339aa08496` after merge.

**PR head technical evidence:** `193ca71e29f9a7ba9b03596f3d33a32e8199ee74`; [full quality Actions #44883737707](https://github.com/RileyTheRiler/being-found/actions/runs/44883737707) **success 46/46 steps**, and [reduced-motion Actions #44883737627](https://github.com/RileyTheRiler/being-found/actions/runs/44883737627) **success**. Exact-head Vercel preview `dpl_ExsNhkiX1HuUkDX34gTtNdQFJJCJ` READY (preview, not production).

**Post-merge evidence:** `main` [Actions #44884594628](https://github.com/RileyTheRiler/being-found/actions/runs/44884594628) **completed success 46/46**, exactly `f0d0b888405faabfdf4f9f1f26f1cb339aa08496`. Vercel production `dpl_3fhesYbJLJLRGqGAPuKihLXo4NYW` **READY**, `target=production`, `githubCommitSha=f0d0b888405faabfdf4f9f1f26f1cb339aa08496`; `being-found.vercel.app` alias points to that exact deployment, verified after Actions completed. These checks **do not** establish a subsequent docs-only deployment.

**What shipped:** optional early dialogue with Leena; object inspection tracked separately from Leena's words; no inferred memories/diagnosis on leave; no unconsented private message reading; heading-first scroll restoration on phones; additional 360×640, phone/tablet/desktop branch QA and screenshots. No changes to FLATS/VISITS, mandatory Noor→Dele→Walt, save schema, input parity, consent or motion renderer. QA screenshot artifact `being-found-qa` ID `14699018942` reviewed; early-leave 390×844 heading is visible after fix. 
**Open:** [issue #20](https://github.com/RileyTheRiler/being-found/issues/20) for coherent spatial library art/interaction, independent paid bipolar lived-experience editorial review, physical TalkBack/VoiceOver/switch-control and participant pilot. `reviews/LEENA_REVIEW_PACKET.md` plus `reviews/leena_feedback_log.csv` are prepared but **no human review recorded**. Release remains **fictional classroom preview, not validated nor pilot approved**.

**Editorial assessment:** The source-based and screenshot-based review corrected observed/communicated/private-message and phone heading problems. The 2.5D library representation and ordinary physical agency remain weak, and the character remains unvalidated fiction pending independent paid bipolar lived-experience editorial consultation. No reviewer opinion is recorded in the empty feedback log. The dated memories are *retrospective fictional speech*, not simulated episode transitions.

---

## 8.5.4 interaction audit — 21 November 2026 (code review; no human validation)

**Verified starting code:** PR #18 merge `8f0463ad9c383fb1aaf0ced7fd81e63ba7e1686a`. Focused follow-up branch: `fix/8.5.4-leena-evidence-debrief`. This is a source-based editorial/interaction appraisal, **not** a lived-experience review.

### Critical findings and change decisions
1. **False observation on early exit (critical):** Previous `ending` always said the visitor saw Leena pause at the calendar, cart and message even if no object was opened. Fix: track `inspected` separately from spoken `seen` replies. Debrief reports only inspected object observations and the exact replies/recollections the player heard. Leaving before exploration no longer creates a diagnostic or recollection claim.
2. **Mandatory three-object gate (high):** The only way to reach conversation was to answer one prompt about all three props. This made Leena's interaction feel like a checklist and could imply personal disclosure was an earned reward. Fix: offer `Talk with Leena` immediately; object engagement remains optional and unscored.
3. **Disclosure boundary (high):** Conversation about bipolar disorder happens only after choosing to speak with Leena; both dated recollections remain separately selectable after permission. A direct disclosure is attributed to Leena, not inferred from a movement, pause or prop.
4. **Visual grounding (open):** The library is recognizable through a window, shelves, desk and three labeled prop buttons but is currently simple CSS illustration rather than the main 2.5D atlas/room art. Leena is an abstract figure with no distinct facial characterization; objects feel like floating interface markers. **Not fixed in this bounded PR.** Design a separate optional spatial-library slice with screenshot/assistive-technology comparisons, no renderer rewrite and no FLATS/VISITS insertion.
5. **Everyday character depth (open):** Her work and friendship appear, but major choices live in text panels, her specific interests are thin and her agency has few environmental consequences. Obtain compensated review before adding new psychiatric detail or dramatic episode scenes. Do not interpret absence of symptoms in the present as a claim about bipolar disorder.
6. **Reflection (partially addressed):** Distinguishing observed/communicated/inferred/unknown works pedagogically only if the content is branch-specific. New branch matrix tests immediate leave, inspect-without-reply, early conversation, selective recollections, refusal and four unscored endings. This does not validate the educational inference.

7. **Phone privacy (high):** Previously an object observation exposed Nia's private invitation as if a visitor could read Leena's screen without consent. The object now only describes a notification whose content is not visible. Leena may voluntarily disclose context in her reply or recollections. Browser QA guards against revealing Nia or the event before she speaks.

8. **Mobile panel scroll position (high; screenshot verified):** On the previous branch head, the 390×844 early-leave screenshot opened midway through the debrief, hiding the new heading under the sticky topbar. `render()` now restores the dialog scroll position to the beginning before focusing the replacement heading. Automated 360/390/820/1180/1440 checks assert the heading is visibly below sticky chrome after transitions; inspect regenerated screenshots and exact-head CI before release.

**Reviewer materials:** `reviews/LEENA_REVIEW_PACKET.md` inventories 21 branches and independent review questions. `reviews/leena_feedback_log.csv` is an empty decision log, not fabricated feedback. Physical TalkBack, VoiceOver, switch access, visual design scrutiny and human classroom pilot remain outstanding.

# Leena optional narrative — issue #17 editorial record

**Status:** Authored fiction, subject to independent paid lived-experience review by people living with bipolar disorder. Not validated, not classroom-pilot approved. This record is not a substitute for that review.

## Architecture / boundary

Leena is an optional, self-contained library encounter entered through Rooms. It is not inserted into the nine existing FLATS, VISITS, saved flat indexes, four-client clinic, narrative previews, or the Noor → Dele → Walt guided route. No dice, diagnostic state, mood-dependent input cost, artificial episode switches, or treatment/medication decisions are used. Local story selections are in-memory and reset on replay/close.

The visitor chooses what to notice and which offers to make; Leena chooses whether to discuss her history and can refuse. The game never displays an independent truth about her feelings. Three observable objects recur in distinct, dated recollections disclosed as Leena's own fictional speech.

## Scene review table

| Scene | Apparent claim / limit | Directly communicated | Branches to test |
| --- | --- | --- | --- |
| 20 Nov 2026 calendar, cart, message | A pause is visible, but its cause isn't | Leena's authored response to each of six possible offers | Both responses per prop, any order, early exit |
| Conversation | Diagnosis is not a causal key to an ordinary action | Leena voluntarily says she lives with bipolar disorder and sets limits | Permission, offer to stop (refusal), stay with today, leave |
| April–May 2025 recollection | An expansive sense of the future is retrospective and not equivalent to a universal manic/hypomanic state | Leena's distinct fictional recollection | Hear, return, skip |
| Oct–Nov 2024 recollection | A difficult future is one period, not an inevitable depressive script | Leena's distinct fictional recollection | Hear, return, skip |
| Current response | No best empathy score or automatic fix | Leena's response/boundary | Listen, ask support, uncertainty, stop |
| Debrief / replay | Differentiate observation, communication, inference and unknown | No private experience verified | All endings, replay, return focus |

## Preliminary grounding, not validation

- [NIMH Bipolar Disorder](https://www.nimh.nih.gov/health/publications/bipolar-disorder): episodic time course, variable presentation, and distinction among clinical subtypes. No subtype is specified in Leena's story.
- Farr, J., Smith, J. A., & Rhodes, J. E. (2024 online / 2025 volume). [The experience of mood change over time for people diagnosed with bipolar disorder](https://doi.org/10.1080/09515070.2024.2395957). Longitudinal interpretative phenomenological analysis of three participants; suggests attention to agency, relationships and anticipated futures across periods. Idiographic sample cannot validate Leena or support a universal script.
- Matthew Ratcliffe's existential-feelings account motivates the distinction between an ordinary object and the possibilities it affords, without conferring direct access to subjectivity.

## Review required before pilot or validation claim

Recruit and compensate independent reviewers with bipolar lived experience; share all six object-response branches and the refusal/leave/replay branches, not only a single walkthrough. Record feedback and disagreement (including rejected edits) with consent and no identifying clinical details. Ask about dated recollections, disclosure pressure, agency, episodic stereotypes, implied treatment narratives and the visitor's role. Conduct separate real-device and assistive-technology checks (TalkBack, VoiceOver, keyboard and switch access); run a formative learner study with non-graded comprehension questions. These tasks are outstanding.
