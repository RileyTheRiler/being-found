# Being Found — classroom pacing and comprehension pilot (8.5.4E)

**Protocol, not results.** The 10–15 minute classroom target has **not** been measured with first-time players. Automated Playwright runs test transitions at machine speed and do not supply a human completion-time estimate.

## What to run

Invite at least 5 first-time SLP students, plus independent accessibility testing on a mobile screen and with assistive technologies. Separately arrange compensated lived-experience review with people relevant to the fictional conditions; do not treat classmates as substitutes for that review.

Tell participants: “Play the Guided Story as you would on your own. We are assessing the game, not your empathy or clinical ability. You can stop or skip anything.” Do not explain the mechanics unless they become stuck. Give them their preferred input method and offer a quiet room.

## Minimal observation sheet

| Anonymous ID | Device/input | Began/finished | Elapsed (mm:ss) | First action (seconds) | Blockers/assistance | Misread story as diagnosis? | Relevant participant feedback |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | | | | | | | |
| P02 | | | | | | | |
| P03 | | | | | | | |
| P04 | | | | | | | |
| P05 | | | | | | | |

- At the end of the final reflection, have the learner open **Facilitator questions**. That panel shows local elapsed time and chapter durations. Time is counted from opening Guided Story, **including** pauses and inactivity. It is not shown during play, transmitted, or automatically persisted. If the learner agrees, manually record the time; they may also use the “Copy before and after” button to share their own answers, with consent.
- Record time to the first **meaningful** action separately. An automatic chapter beat or opening the guide does not count.
- Record each time an observer intervenes and why, particularly at Noor’s practical/enticing markers, Dele’s consent/silence, the fictional authored day, and Walt’s speech access.
- Do **not** identify participants by name or retain free-text reflections without explicit permission. Prefer counts and paraphrases, not recordings.
- Exclude optional facilitator group discussion from the individual completion-time target. Mark when the learner opens the facilitator panel, not when the group completes a discussion.

## After playing: ask without coaching

1. What did you **see or hear** Dele communicate directly? Which details came only from Mara?
2. What, if anything, did you infer about Dele? What remains unknown? Ask about a fictional room account only if the learner encountered one.
3. What is different between “can physically do something” and “the action feels available or meaningful”?
4. In Walt's encounter, how would you ask about a change in participation without assuming what it means?
5. What slowed you down, felt implausible, or made you feel pushed toward one “right” answer?

## Interpreting the sample

- **Pacing target:** 10–15 minutes for the complete individual route, including initial and final reflections. Report the median, range, number outside the target, and blockers. Five learners produce **formative** evidence only; they cannot establish a population norm.
- **First-use target:** A learner can choose a meaningful action within 20 seconds without instructor prompting.
- **Conceptual risks:** A learner equates a diagnosis with “sealed” capacities, confuses the fictional day with Dele's report, or treats silence as the universal correct intervention.
- **Accessibility:** Run separate keyboard and screen-reader completion checks; automated focus and resize tests do not establish assistive-technology usability.
- **Revision rule:** Fix common blockers or harmful misinterpretations before adding content. If the route consistently exceeds 15 minutes, remove repetitive explanation or optional detours before shortening encounters or removing consent-based choices.

**Important:** The in-app timing shows elapsed wall time from the in-tab session clock and includes idle periods. Do not interpret it as focused reading time, reading speed, or demonstrated learning.

## Materials for formative sessions

- [Facilitator sheet](pilot/FACILITATOR_SHEET.md): recruiting, voluntary participation, neutral script, observation and independent debrief.
- [Scoring guide](pilot/SCORING_GUIDE.md): non-graded 0–2 descriptions for four concepts, plus explicit fictional-fact confusion.
- [Blank anonymous CSV](pilot/observations.csv): five empty slots, no identifying personal data.
- [Local summary script](pilot_summary.py): `python3 pilot_summary.py --self-test` and `python3 pilot_summary.py pilot/observations.csv`.
- [Real-device assistive-tech checklist](pilot/ACCESSIBILITY_CHECKLIST.md): manual TalkBack/VoiceOver and keyboard checks; not yet carried out.

The CSV template records **zero** sessions. Its summary must never be represented as pilot outcomes. Time to first meaningful action is now operationalized as the first room-object/choice after Noor’s room loads; keep this definition consistent across sessions. If the sample is used for research dissemination, confirm appropriate institutional review and consent before data collection.

Five learners are appropriate for finding early usability failures, but cannot establish a typical completion time, an intervention effect or a psychometric measure. See https://www.nngroup.com/articles/5-test-users-qual-quant/ for the distinction between formative and quantitative evidence.

## Guided route preflight for 8.5.4E

On the physical device and preferred input, try a Noor room action, leave Dele’s encounter, and continue to Walt. Record a blocker if Guided Story requests a die roll, hold or repeated activation to complete an action. Record the exit the learner actually encountered. A decision to leave or a resident ending the visit is a valid route outcome. Keep optional Rooms and Leena exploration outside the guided completion clock.

Use the [manual accessibility checklist](pilot/ACCESSIBILITY_CHECKLIST.md) for device observations and the [Leena review packet](reviews/LEENA_REVIEW_PACKET.md) for compensated editorial review. Keep completed observations in a private working copy. The repository CSV is a blank template.
