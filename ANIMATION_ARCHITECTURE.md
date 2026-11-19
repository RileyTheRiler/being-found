# Character animation architecture decision — sofa vertical slice

**Date:** 2026-11-18  
**Base:** `main` at `7207a02b9b8defda975ff59e8cdd46840c58d69d`  
**Scope:** Presented character motion only, independent of draft 8.5.2B gameplay.

## Source audit

- `assets/{noor,tomas,dele}_rig.glb` contain earlier 3D-authored characters, but these are not rendered at runtime. Three pre-baked WebP atlases (112×144 × 15 columns × 8 directions) carry six walk poses, four reach poses and one each for sitting, phone, attending and reflecting.
- `sprite_rig.js` draws an entire cell as one image. It can choose a frame, rotate the canvas slightly or composite the phone arm, but it cannot bend a knee or maintain attachment coordinates.
- `art.js` has a reusable, two-segment vector character fallback, but its rendering style does not match the 3D-authored atlas perfectly.
- `BFStageSync.seatMotion` supplies a single authored action-normalized seat/rise progress. `BFNavigation.position` reports a cushion pivot for sitting (y=516), while `room.js` formerly interpreted the pivot as shoes and shrank the entire body to 85%.
- `room.js` provides a rear sofa, two cushions, a separate front apron, and an existing foreground repaint for seated characters. That furniture design is retained.

## Options weighed

| Architecture | Visual possibilities | Cost / compatibility | Decision |
| --- | --- | --- | --- |
| More complete baked sprite sheets | Strongest consistency with existing models, if rendered well | Need a reproducible source-render pipeline and significantly more frame assets for every resident and direction | Desirable after a visual prototype; not immediately available from this repository |
| Fully articulated vector characters | Independent hips, knees, feet and arms; lightweight on mobile | Replacing modeled characters outright changes the art direction | Retain as fallback, not wholesale replacement |
| Full runtime skeletal GLB animation | Accurate attachment and joint motion when well authored | Requires new WebGL, mesh/skeleton loader, camera, lighting, materials and mobile QA; not a safe small change | Defer |
| Generic sprite-sheet transforms | Easy, fast | Cannot fix baked anatomy; previous shrinking and frame swaps already failed | Reject as primary solution |
| **Hybrid: raster torso + procedural two-bone lower body** | Planted feet, independent knees, smooth hips and torso while preserving existing head/clothing imagery | Leg artwork and raster/vector seam require close human visual review | **Implement first, evaluate visually** |

## Implementation and invariants

`sprite_rig.js` now composites the character's opaque raster upper body from the idle atlas cell over independent left/right two-segment legs. A small joint solver changes knee extension as the hips lower; ankles and shoes remain fixed near the room floor. The torso moves down and briefly leans during weight transfer; reduced motion disables its lean.

`room.js` restores the shoe baseline to y=574 when sofa navigation uses the cushion anchor and no longer uniformly shrinks modeled seated residents. Foreground sofa upholstery still covers the lap; shins and shoes should remain visible below. The existing body-frame artwork remains the fallback if model assets are disabled/unavailable.

**No new gameplay timer, flags, skill checks, story effects, chapter events, narrative wording, persistent state or save schema.** The authored sofa action and route sentinel still control entry and departure; animation only reads progress.

## Technical limits / next steps

1. The existing atlas is low-resolution, with no explicit part masks or annotated joint origins. The current upper-body crop and procedural trouser shading may produce visible seams or an imperfect color match; it is a prototype for asset/rig evaluation.
2. Generic camera-facing orientations are handled from existing atlas direction rows, but the leg projection is only approximate. It cannot equal a professionally skinned and authored 3D sit animation.
3. The procedural shin and apron must be checked against screenshots at several moments and on actual devices. Automatic pixel assertions can confirm rendered changes, not human physical plausibility.
4. The technique applies to modeled main actors; NPCs continue through the native vector fallback. Rework the NPC pose only after this path has been visually approved.
5. The next art-production step should restore a reproducible GLB-to-atlas rig renderer with explicit hip, knee, ankle and hand markers and author several intermediate sit/rise poses. Prefer an offline export over loading a full 3D engine at runtime if acceptable quality is attainable.
6. Phone, cooking and painting still have approximate arm/object registration. Do **not** generalize the seated leg composite to these until visual inspection establishes that the silhouette and shading are acceptable.
7. Any classroom approval continues to require compensated lived-experience review, user testing and independent accessibility checking; this animation patch establishes none of those outcomes.

## Verification

Run `npm run build`, `python3 qa_physical_actions.py`, `python3 qa_seated_rig.py`, `python3 qa_character_motion.py`, `npm run qa` and the repository GitHub Actions workflow. `qa_seated_rig.py` clicks the real sofa menu on desktop, phone and tablet, samples model frame and joint geometry, checks shoe planting and hip/knee motion, tests rising from a real stove choice, and captures multiple browser screenshots. It also renders seated Tomas and Dele and checks reduced-motion torso lean.

**Status:** implementation under verification. Do not infer Vercel production status or visual quality from source code or Actions alone.
