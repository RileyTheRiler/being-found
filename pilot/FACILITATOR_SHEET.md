# Classroom pilot — facilitator session sheet (8.4.4)

This is a **formative evaluation of a fictional teaching game**, not a clinical test of participants. It is ready for recruitment and observation; **no sessions have been run**.

## Before each participant

- Invite at least five independent, first-time SLP learners (a convenience formative sample, not a population estimate). Do not assign academic credit based on their answers, speed or participation. Offer a way to decline without consequence.
- Explain the optional nature of the exercise, fiction and potentially sensitive topics (depression, grief, altered reality, communication disability); allow stopping or skipping.
- Ask for consent to observe play and record **anonymous counts and paraphrases**. Do not retain health, diagnosis, identity, or contact information or record audio/video without separate informed permission.
- Start on a clean browser session and record only a pseudonym such as `P01`, device category and input method. Ensure sound is optional and off by default.
- Let the participant use their preferred access method and pace. Make a separate accessibility check if using screen reader, magnification or switch control.

## Read aloud or provide in writing

> “Play the Guided Story independently. We are testing the game, not your empathy or clinical skill. The people and their accounts are fictional; they are not examples of how everyone with a condition feels. You may skip an activity, take a break, or stop. If something does not work, tell me what you were trying to do.”

Do not explain the intended philosophical distinction or show the scoring guide before playing.

## Observe; do not coach unless needed

1. Start elapsed recording when the participant selects **Start the guided story**. The in-app facilitator timing includes breaks and idle periods; independently record wall time as a cross-check.
2. After the learner enters **Noor’s room**, start a separate first-meaningful-action clock. Stop at the first room-object or narrative choice. Opening the guide or an automatic chapter transition does **not** count. Record seconds.
3. Mark any blocker and where it happened: title, Noor, Dele, authored day, Walt, reflection, or multiple. Count each prompt/intervention and note its cause without blaming the player. The script counts no automatic data.
4. Let the player finish the final reflection before opening **Facilitator questions**. Record completion wall time excluding optional group discussion, and the in-app elapsed time if participant agrees. If they quit, mark `completed=no` and leave duration empty or record it separately outside the completion analysis.
5. Do not ask them to think aloud during the measured route by default; that can alter timing. A separate think-aloud pass can follow for usability diagnosis.

## After play — independent questions

- What is the difference between being **able** to perform an action and having it **feel possible or meaningful**?
- What did you directly see or hear Dele communicate, and what did you only infer or read in the separately authored room?
- What would you ask Walt about his preferred communication support before intervening?
- Could any one of these fictional accounts establish what everybody with the same condition experiences? Why or why not?
- Did you treat anything from the fictional room as an observed fact about Dele? What blocked or confused you?

Offer oral, written or AAC responses. The facilitator records rubric categories, **not personal quotations** unless separate consent is given. Use `pilot/SCORING_GUIDE.md` only after the independent questions.

## After all sessions

Enter anonymous data in `pilot/observations.csv`, then run `python3 pilot_summary.py pilot/observations.csv`. The command outputs descriptive totals, completion-time median/range, target counts, blockers and rubric frequencies. It does **not** send anything online or calculate an empathy score.

Prioritize recurring interface failures and the inference that the authored room reveals Dele’s actual experience. Do not conclude that five users establish an educational effect or typical duration. If disseminating findings as human-subjects research, confirm instructor/IRB requirements before collecting research data.
