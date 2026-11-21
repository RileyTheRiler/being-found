# Leena — independent editorial and accessibility review packet

**Release context:** Being Found 8.5.4 development, optional Rooms narrative. Fictional adult library worker with bipolar disorder. **Status: no independent lived-experience or assistive-technology review has occurred.** The public build remains a classroom preview, not a validated educational intervention or a representation of all people with bipolar disorder.

## How to use this packet
Provide compensated reviewers with the current PR preview URL, this file, `LEENA_EDITORIAL.md`, and time to explore without observation or pressure. Arrange fair compensation in advance, reimburse relevant access costs, and allow written, spoken, screen-reader or asynchronous feedback. Reviewers may skip material or decline questions. Do **not** request diagnosis documentation, medication history, episode details or personal trauma disclosure. Collect only feedback they consent to share. Do not store personal health information or real names in the public repository.

Reviewers can examine fiction, interaction design, omissions and accidental implications. A reviewer does not need to speak for other people with bipolar disorder or validate Ratcliffe's theory. A disagreement is informative and should be logged rather than averaged into false consensus.

## Narrative intent and limits
- **Philosophical:** The same ordinary calendar, book cart and invitation may carry different felt possibilities across dated periods in one fictional person's account. A visitor never acquires direct access to her private feeling.
- **Clinical:** No bipolar subtype is identified; the 2024/2025 recollections are not a disorder-course demonstration, diagnostic criteria or induced mood change. Her everyday decisions do not require a diagnostic explanation.
- **Relational:** Leena decides what to disclose, when to answer her friend, when help is useful, and when to stop. Leaving is allowed without punishment. None of the four final response choices is graded as universally correct.
- **Interaction:** The current library is an illustrated dialog with three object targets, not a walkable flat; please flag places where its UI suggests a checklist, a quiz or involuntary disclosure.

## Complete branch inventory

| ID | Route | What to inspect |
| --- | --- | --- |
| R0 | Rooms → Leena → leave immediately | Debrief reports only visible room and initial ordinary speech; no unwitnessed pauses, disclosure, memories |
| R1 | Open calendar → return without asking → leave | Observed calendar detail but no claimed answer |
| R2 | Calendar → ask what she wants → return | Her reply leaves Saturday undecided |
| R3 | Calendar → let her consider it → return | Her choice to answer Nia tomorrow |
| R4 | Cart → offer to sort → return | She directs the work herself |
| R5 | Cart → ask whether she wants help → return | She declines without penalty |
| R6 | Message → ask about replying now → return | She prefers to answer later |
| R7 | Message → give space → return | Nia's relationship is not defined by diagnosis |
| R8 | Examine 1 item → talk with Leena | No mandatory 3-item checklist; observe distinction between conversation and object exploration |
| R9 | Talk immediately, without examining objects | Her voluntary disclosure must not fabricate observations |
| R10 | Conversation → ask to stop | Leena agrees and conversation ends without memories |
| R11 | Conversation → leave | No involuntary intimate detail beyond what she already spoke |
| R12 | Permission → return to present without memory | Neither dated recollection enters the debrief |
| R13 | Permission → April–May 2025 only | Recalls expansive future-planning without treating it as a universal clinical episode |
| R14 | Permission → October–November 2024 only | Recalls remote future-planning without treating it as an inevitable depressive script |
| R15 | Permission → both memories, either order | Both dates retained; no immediate switching of state |
| R16 | Response → listen | Listening without a scored “best” answer |
| R17 | Response → ask about support | Leena can define a practical task and refuse other intervention |
| R18 | Response → state uncertainty | No claim to decipher her thoughts |
| R19 | Response → accept ending | Clear resident boundary |
| R20 | Replay, leave, Escape, and return to Rooms | No persistent story-state contamination; focus returns to trigger |

For each branch, record exact on-screen text, objects clicked, chosen options and where the debrief overclaims. Review both the **spoken** content and the **mechanic** that grants or withholds access.

## Questions for independent lived-experience reviewers
1. Where does Leena feel like an individual worker/friend/reader rather than a diagnostic teaching device? Where does she not?
2. Does any branch imply she is obliged to explain, disclose or accept support? Does leaving feel morally graded?
3. Which ordinary, positive, difficult or unresolved moments are missing? Is any detail stereotyped?
4. Are the April–May 2025 and October–November 2024 memories credible as *one person's retrospective account* without collapsing bipolar I/II, suggesting psychosis, or turning choices into symptoms?
5. Does the representation of time, possibility and agency help, obscure or distort the experience described? May the same objects carry different significance without requiring a neat lesson?
6. Are the visitor's choices grounded in consent? Is any final response unreasonably privileged?
7. Where does the debrief confuse observed, communicated, inferred and unknown? Include early departure and refusal.
8. What should be removed rather than “fixed”? Record disagreement and uncertainty.

## Independent accessibility testing
Automated Chrome Playwright and axe-core may identify severe/critical issues, layout intersection and focus errors, **but they cannot sign off on accessibility**.

Manual test matrix (record tester, date, device/OS, browser, screen reader/input, steps, expected result, actual result, severity, evidence, retest):
- Android phone, TalkBack, touch exploration and linear swipe; object button names, heading announcements and dialog closing.
- iPhone/iPad, VoiceOver, portrait and landscape, rotor headings and focus order; ensure background is not accessible while the modal is open.
- Windows/macOS physical keyboard, zoom to 200%/400% as feasible, Tab and Shift+Tab, Escape, screen-reader reading of the four debrief categories and initial heading.
- Switch access (Android Switch Access or iOS Switch Control) through all three objects, response buttons, consent refusal, leave, and replay; target reachability and predictable order.
- Reduced motion and ordinary motion on a physical device; check no timing pressure and no hidden content.
- Low bandwidth/device CPU and text scaling; check no truncated actionable buttons or clipped scroll.

## Decision and signoff procedure
Use `reviews/leena_feedback_log.csv` without personal identifying or clinical details. Assign a pseudonymous reviewer code managed privately, never a diagnosis label. Quote feedback only with reviewer consent. Every proposed edit gets a disposition (accepted/rejected/deferred), reason, owner and retest evidence. Mark disagreements separately. Any unresolved claim about lived experience remains open; a passing technical test does not close it.

**Open before classroom approval:** at least independent compensated lived-experience consultation with recorded editorial decisions; device/assistive-technology testing; formative learner pilot of comprehension and pacing; safety and participant governance review. No review or signoff is recorded by creating this packet.
