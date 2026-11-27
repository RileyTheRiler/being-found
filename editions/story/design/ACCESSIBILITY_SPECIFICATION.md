# Story access requirements

|Surface|Required observable behavior|Verification|
|---|---|---|
|Object use|Named buttons reach every available activity without spatial aiming. One activation per decision; no clock.|Complete route with Tab/Enter; compare touch, mouse and button outcomes.|
|Overlays|Pause, phone, card, Notebook and settings receive focus; returning restores a usable control. Background controls stay inactive.|Test Tab/Shift-Tab, Escape and return after skip, including during speech.|
|Text and sound|Speaker name remains readable at largest text size; choices remain untimed. Independently adjustable audio and captioned meaningful cues.|Check five viewport sizes, reduced motion, sound off and speaker identification. Listen separately on speakers and headphones.|
|Motion|Reduced motion preserves event order, content notes and environmental outcomes. Avoid involuntary tracking of a moving target.|Compare the same scene in both settings. Inspect contact frames and focus at transitions.|
|Continuity|Pause states the checkpoint policy; Continue and Resume restore the same place. Skipping a private chapter leaves its choices unknown.|At each checkpoint, record the saved chapter, scene and choices. From separate copies use title Continue and Chapters → Resume. Compare the saved checkpoint before and after each route, then reload and compare location, focus, attribution and subsequent play.|

Use the [IGDA accessibility guidance](https://igda-gasig.org/get-involved/sig-initiatives/resources-for-game-developers/) alongside hands-on evaluation. Automated semantic inspection and headless viewport coverage do not establish usability with TalkBack, VoiceOver or a physical switch. Record those observations privately with consent.
