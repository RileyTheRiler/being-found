## 8.5.4 interaction audit — 21 November 2026 (code review; no human validation)

**Verified starting code:** PR #18 merge `8f0463ad9c383fb1aaf0ced7fd81e63ba7e1686a`. Focused follow-up branch: `fix/8.5.4-leena-evidence-debrief`. This is a source-based editorial/interaction appraisal, **not** a lived-experience review.

### Critical findings and change decisions
1. **False observation on early exit (critical):** Previous `ending` always said the visitor saw Leena pause at the calendar, cart and message even if no object was opened. Fix: track `inspected` separately from spoken `seen` replies. Debrief reports only inspected object observations and the exact replies/recollections the player heard. Leaving before exploration no longer creates a diagnostic or recollection claim.
2. **Mandatory three-object gate (high):** The only way to reach conversation was to answer one prompt about all three props. This made Leena's interaction feel like a checklist and could imply personal disclosure was an earned reward. Fix: offer `Talk with Leena` immediately; object engagement remains optional and unscored.
3. **Disclosure boundary (high):** Conversation about bipolar disorder happens only after choosing to speak with Leena; both dated recollections remain separately selectable after permission. A direct disclosure is attributed to Leena, not inferred from a movement, pause or prop.
4. **Visual grounding (open):** The library is recognizable through a window, shelves, desk and three labeled prop buttons but is currently simple CSS illustration rather than the main 2.5D atlas/room art. Leena is an abstract figure with no distinct facial characterization; objects feel like floating interface markers. **Not fixed in this bounded PR.** Design a separate optional spatial-library slice with screenshot/assistive-technology comparisons, no renderer rewrite and no FLATS/VISITS insertion.
5. **Everyday character depth (open):** Her work and friendship appear, but major choices live in text panels, her specific interests are thin and her agency has few environmental consequences. Obtain compensated review before adding new psychiatric detail or dramatic episode scenes. Do not interpret absence of symptoms in the present as a claim about bipolar disorder.
6. **Reflection (partially addressed):** Distinguishing observed/communicated/inferred/unknown works pedagogically only if the content is branch-specific. New branch matrix tests immediate leave, inspect-without-reply, early conversation, selective recollections, refusal and four unscored endings. This does not validate the educational inference.

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
