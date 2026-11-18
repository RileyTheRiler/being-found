# Being Found — design guardrails

Status: normative project rules for the 8.5.2 guided-route revision. These are design requirements, **not** claims that 8.5.1 already satisfies them.

## Educational purpose

Being Found is an authored, replayable teaching narrative for speech-language pathology learners. It asks learners to distinguish **what they observed**, **what a person communicated**, **what they inferred**, and **what remains unknown**. Matthew Ratcliffe's account of existential feelings informs the interpretation but does not grant a player direct access to another person's experience.

## Five invariants

1. **No privileged access.** A question, choice, color shift, state label, score, or room view must never imply that the learner has verified the resident's private experience. A fictional first-person account is possible only when clearly attributed to its author or to a character deliberately telling a story.
2. **Resident agency and consent.** Accept a person's request to stop, leave, or decline an offer. Never enter a room or present a private account as shared without an explicit scene-level reason. All exit branches, including leaving a note before entry, must be tested.
3. **Equal input effort.** Fictional conditions do not change the physical difficulty of operating the classroom controls. No required multi-tap or hold to represent impairment, no state-dependent player movement penalty, no dice on the guided route.
4. **Clinical uncertainty.** Keep a visible distinction among third-party report, direct observation, resident communication, provisional inference, and a contingent next action. Communication access and individual preference precede assumptions about motivation or diagnosis.
5. **Evidence limits.** Do not imply that fictional characters, world-state variables, or clinical labels represent all people with a condition. Literature motivates and constrains scenes; it cannot validate an invented resident. Human lived-experience and assistive-technology checks remain pending until completed.

## Mode boundaries

- **Guided Story:** primary classroom path, encounter-first. The learner listens, asks, offers, waits, documents and reflects; residents control disclosure. Remove the mechanic-and-answer-key structures inconsistent with the invariants.
- **Rooms:** optional authored narrative. Legacy mechanics remain during incremental migration, are not evidence of capability and are subject to an explicit post-pilot decision.
- **Sandbox / Author's Notebook:** an interpretive teaching model, **not a measurement** of residents or a diagnostic tool. Label five-variable values as designed parameters rather than factual dimensions of experience.
- **Pilot mode:** controlled classroom configuration. Developer URL overrides must not reactivate experimental mechanics during a pilot.

## Review and acceptance process

Each sensitive change records: (a) scene and source anchor, (b) the apparent claim conveyed by interaction, (c) what the relevant person directly says or chooses, (d) source grounding and limitations, (e) test for every branch, and (f) lived-experience feedback where available. Narrative wording changes alone do not resolve mechanics that still convey a contradictory claim.

Before a student pilot: run all automated regressions, walk the full guided route on relevant screen sizes and input methods, obtain independent accessibility testing, and commission compensated review of sensitive stories. A five-person formative pilot can reveal comprehension problems; it cannot demonstrate an intervention effect or validate an empathy scale.

## Release sequence

- **8.5.2A:** reproducible build, controlled mechanic flags, unified QA entrypoint, source-backed rules (no gameplay change).
- **8.5.2B:** explicit consent/exit outcomes, no capability simulation in Guided Story, no apparent world-reveal or hidden universally fitting action.
- **8.5.3:** focus, screen-reader semantics, visual layout, visible seated/lying residents, real-device checks.
- **8.5.4:** review and shorten authored content with branch-aware timing and appropriate clinical framing.
- **8.5.5:** fixed/reproducible contexts, risk probes and independent pilot dry runs.
- **8.6.0:** pilot-informed optional-mode review, staged data extraction and state-machine cleanup.

Primary references and outstanding review tasks: `EDITORIAL_REVIEW.md`, `CLASSROOM_PILOT.md`, `pilot/SCORING_GUIDE.md`, `ROADMAP.md`.
