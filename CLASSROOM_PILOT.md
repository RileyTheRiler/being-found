# Being Found — classroom pacing and comprehension pilot (8.4.4)

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
2. Which part of the authored room did you find yourself treating as fact about Dele?
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

## Ready-to-run 8.4.4 packet

- [Facilitator sheet](pilot/FACILITATOR_SHEET.md): recruiting, voluntary participation, neutral script, observation and independent debrief.
- [Scoring guide](pilot/SCORING_GUIDE.md): non-graded 0–2 descriptions for four concepts, plus explicit fictional-fact confusion.
- [Blank anonymous CSV](pilot/observations.csv): five empty slots, no identifying personal data.
- [Local summary script](pilot_summary.py): `python3 pilot_summary.py --self-test` and `python3 pilot_summary.py pilot/observations.csv`.
- [Real-device assistive-tech checklist](pilot/ACCESSIBILITY_CHECKLIST.md): manual TalkBack/VoiceOver and keyboard checks; not yet carried out.

The CSV template records **zero** sessions. Its summary must never be represented as pilot outcomes. Time to first meaningful action is now operationalized as the first room-object/choice after Noor’s room loads; keep this definition consistent across sessions. If the sample is used for research dissemination, confirm appropriate institutional review and consent before data collection.

Five learners are appropriate for finding early usability failures, but cannot establish a typical completion time, an intervention effect or a psychometric measure. See https://www.nngroup.com/articles/5-test-users-qual-quant/ for the distinction between formative and quantitative evidence.

## 8.5.0 pre-pilot regression scope (not field results)

Browser QA tests now cover keyboard focus when the classroom Guide expands or collapses, leaving a modal, and reduced-motion scrolling to a focused reflection field. A real keyboard-only playthrough must still test every action, including repeated-input 'heavy' choices, and separate screen-reader and switch/alternative-input checks remain mandatory. During pilot observation, explicitly ask whether hold/three-tap suggested motor impairment or distracted from the distinction between ability and experienced possibility. No participants have been tested.

## 8.5.1 manual input parity check

Before a classroom session, attempt a heavy room action using (1) three keyboard Enter or Space activations, (2) three ordinary pointer taps and (3) a pointer hold, and confirm that the same authored action results. Try the preferred alternative input method separately. Do not infer accessibility from the automated desktop/phone Chrome regression alone. Observe whether the extra input confuses the philosophical distinction; record an issue rather than treating the player as failing a skill test.

## 8.5.1 automated preflight outcome

The 8.5.1 implementation passed 30/30 automated GitHub Actions steps in [run 44269157774](https://github.com/RileyTheRiler/being-found/actions/runs/44269157774) at `c97946c35495f58fbd26e1bbf0dabce485831118`. This includes keyboard and pointer triple-activation behavior with optional Story attempts disabled and guided reduced-motion/focus regressions. **This does not replace the real-device checklist, independent first-time classroom pilot, or compensated lived-experience consultation.** The observation template remains blank; do not report pilot outcomes until sessions occur.
