# Being Found: Story Edition

A standalone, narrative-first version of Being Found with no classroom framing. It is a separate game from the classroom build: its own engine, controller, saves and content. Nothing here changes the classroom edition.

## Play and build

The root `npm run build` also builds this edition into `dist/story/index.html`, so the deployed site serves it at `/story/` beside the classroom edition. It is one self-contained page.

```sh
npm run build                          # whole site; Story Edition lands in dist/story/index.html
node editions/story/build.js           # Story Edition only, into editions/story/dist/index.html
```

## Tests

```sh
# against the served build (same server as the root suite: python3 -m http.server 8770 --directory dist)
python3 editions/story/test/qa_story.py            # CI smoke: every chapter starts, plays random actions and choices, no page errors
python3 editions/story/test/qa_resume.py           # both public resume menus, Classroom isolation
python3 editions/story/test/qa_doorstep.py         # deterministic doorstep/disclosure and legacy saves
# local, slower: a whole campaign with random choices, from any chapter
node editions/story/build.js && python3 editions/story/test/playthrough.py prologue 1
```

`?chapter=<id>` starts a chapter directly (ids: prologue, noor, door, leena, dele, walt, outside); `&fast=5` speeds game time for testing.

## Campaign

| # | Chapter | Perspective | Location |
|---|---------|-------------|----------|
| 0 | One Window Is Still Lit | Prologue, cinematic | Linden Row before dawn |
| 1 | An Ordinary Morning | Noor | Noor’s flat, the landing, the street, the park |
| 2 | Behind the Door | Noor visits Dele | The landing, Dele’s flat |
| 3 | A Different Saturday | Leena | Linden Library |
| 4 | The Same Door | Dele (authored perspective) | Dele’s flat at night, the street in rain |
| 5 | The Words Between Us | Mara visits Walt | Walt and June’s house and workshop |
| 6 | Outside Again | Noor, a week later | Noor’s flat, the street, dusk |

Choices carry forward: the tea Noor makes stays (cold) on Dele’s table that night; a note slid under the door is on his floor; Dele’s reply to Mara decides whether he is at the bakery a week later; Leena’s decision about the 14th decides whether she gets on the bus; Noor decides what to paint in Dele’s window.

## Design rules this build keeps

- No scores, meters, diagnoses on screen, dice, timers, or effort penalties. Movement speed is identical for every character.
- Dele’s evening is unconditional and labelled as an authored perspective that Noor never sees. It is never unlocked by conversation choices.
- Every outcome of the visit (let in, “not today”, a note, not knocking) is valid and the story continues.
- Leena’s dated recollections are optional and in her own voice.
- Walt’s chapter models supported conversation (waiting, yes/no questions, writing key words, gesture) and his own goal.
- The Notebook (philosophy, references, “what you have seen”) is optional. Pop-ups can be turned off.
- Accessibility: every object and button is reachable by keyboard (Tab, Enter, E, WASD/arrows, Q, N, Esc); untimed choices; text size and speed; reduced motion; sound captions; separate music/ambience/effects volume; content notes and skip per chapter; dialogue history.

## Source layout

```
editions/story/src/00-core.js        utilities, settings, versioned save, pausable clock, story flags
src/10-iso.js         isometric projection, plane drawing, boxes, depth sorting
src/20-art.js         rooms, walls, windows, furniture, props (all procedural)
src/21-exterior.js    sky, street, facades, trees, lamps, bus
src/30-figure.js      the illustrated character rig and cast
src/40-world.js       scenes, A* movement, camera, lighting pass, particles, picking, sprite cache
src/50-audio.js       WebAudio ambience, interaction sounds, shared-motif music themes
src/60-ui.js          captions, dialogue, choices, object menus, phone, cards, menus
src/70-script.js      scripting API (G), exploration, input, chapter flow, saves, screens
src/80-locations.js   the six locations: layout, objects, seats, lights
src/85-notebook.js    optional Notebook pages grounded in Ratcliffe
src/89-kit.js         planner, toast card, bus, street lights
src/90–95-*.js        the chapters
src/99-main.js        boot and frame loop
```

## Relationship to the classroom edition

This edition shares no code with `src/index.html` or the overlay modules, and it changes none of them. Its saves use their own keys (`beingfound.story.*`). It supersedes the experimental generator approach in PR #35, which patched the classroom page into a story page.

## Not yet done

Lived-experience review (depression, bipolar disorder, aphasia), real-device and assistive-technology testing, and first-time player testing have not happened. Automated headless playthroughs with random choices complete the whole campaign without script errors.
