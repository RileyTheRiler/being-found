# Being Found development instructions

This repository is the canonical source for **Being Found**.

## Before changing the game
1. Read [HANDOFF.md](HANDOFF.md) **first**. Follow its current build, layout, known-issues, and testing instructions.
2. Read [DESIGN_BRIEF.md](DESIGN_BRIEF.md) before any change to story text, mechanics, characters, UI wording, reflection prompts or pilot materials. It holds the learning outcomes, rules (R1 to R5), Ratcliffe grounding and the decision log. Cite its IDs in PR descriptions. If a change would break a rule or depends on an open decision, ask Riley before building it.
3. Read [README.md](README.md) and [SAVE_NOTES.md](SAVE_NOTES.md) for the latest implementation and change history.
4. Inspect the current remote branch and existing code before modifying anything. Do not assume a previous chat's local files are newer than this repository.

## Editing and verification
- Make edits to the source files in this repository. The browser release is built with `npm run build` into `dist/`.
- Respect the layered architecture described in `HANDOFF.md`; avoid introducing redundant UI, mismatched states, or new patch conflicts.
- Run `npm run build` and relevant tests when the execution environment allows. Clearly report anything untested.
- Keep `SAVE_NOTES.md` updated for meaningful implementation changes, including outstanding regressions or checks.
- When Riley rules on an open design decision, move it to "Decided" in `DESIGN_BRIEF.md` in the same PR that implements it. Keep release facts (commit IDs, test counts, deployment state) out of `DESIGN_BRIEF.md`.

## Publishing every update
- **Commit and push each completed game update to this GitHub repository.** The default branch is `main`; if work occurs on another branch, push that branch and provide the PR/merge status.
- Verify that GitHub contains the new commit before claiming an update has been pushed.
- Report the commit SHA (or link), major changes, and build/test results.
- Never claim deployment to Vercel merely because code was pushed. Confirm deployment separately if requested or if deployment status is available.

These instructions apply to future updates, not only the current working session.

## Chat handoffs
- Proactively tell the user when starting a new development chat is recommended: after a substantial completed milestone, after extended debugging, or when accumulated conversation context risks mistakes. Do not recommend a new chat merely because a new version exists.
- Before suggesting a fresh chat, commit all completed work, record the current branch/commit, tests, outstanding bugs, and next step in `HANDOFF.md` and `SAVE_NOTES.md`.
- In a new chat, begin by reading `HANDOFF.md` from GitHub again; do not rely on remembered code state.
