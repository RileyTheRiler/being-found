# Being Found — release and production controls

Status: **documented procedure only; production branch policy has not been changed**.
Last inspected 2026-11-19. Before 8.5.2 promotion, the Vercel production deployment tracked GitHub `main` at `89cfa38`. PR #3 preview deployments target `null` (not production).

## Present workflow (in force)

1. Read `HANDOFF.md`, `AGENTS.md`, `DESIGN_GUARDRAILS.md` and the relevant release review.
2. Develop in a feature branch. Leave the pull request in draft until build, quality workflow and branch-specific regressions are green.
3. Run `npm run qa`, the complete GitHub Actions quality workflow, and browser playthroughs for both 390×844 and 1440×900. Inspect the branch's Vercel preview and the generated semantic version plus commit identifier.
4. Check each consent exit, guided/pilot capability prohibition, saved-state migration, optional Rooms mechanics, and accessibility. Do not substitute tests for independent human accessibility/lived-experience review.
5. When acceptance gates are satisfied, authorize a reviewed PR merge to `main` with a fixed expected head SHA. **At present, merging to `main` automatically promotes that commit to the public production URL.**
6. Verify post-merge GitHub Actions. Inspect the Vercel production deployment metadata `githubCommitSha` and confirm it exactly matches the final `main` commit. Verify production alias/response separately where possible. Do not assume a READY preview is production.
7. Retain the classroom-preview notice until independent accessibility checks, compensated lived-experience consultation and a formative participant review are complete. A passing CI suite is not classroom approval.

## Proposed release-only workflow — not enabled

The safer future setup is to keep development on `main` and create a protected release branch. Configure **Vercel's Git production branch** to that release branch, keep feature/main commits as previews, and promote only reviewed, tagged release commits. Protect the release branch against direct pushes and require checks and explicit approval.

**Do not switch the Vercel production branch automatically.** The available project settings response did not expose the Git production-branch configuration, and the available Vercel project update operation does not accept a production-branch field. Changing deployment routing without a confirmed owner account operation and an alias continuity check could interrupt the existing public URL. This requires a separate verified account-level operation before enabling the proposal.

## Incident response

If production metadata does not match the intended Git commit, stop calling the release deployed. Investigate build/alias status, and restore the last verified production deployment through an explicitly approved rollback. Record deployed commit, GitHub Actions run, Vercel deployment ID, and known limitations in `HANDOFF.md` and `SAVE_NOTES.md`.
