"""Static authored-text guard for the 8.4.1 editorial pass.

Run after npm run build. This checks exact source and production copy but is
not a lived-experience, phenomenological, or classroom validation.
"""
from pathlib import Path

source=Path("src/index.html").read_text(encoding="utf-8")
built=Path("dist/index.html").read_text(encoding="utf-8")
required={
    "Dele scope":"An authored account of one severe depressive experience",
    "Tuesday context":"The kettle and brushes are where Dele left them",
    "meal interpretation":"possibilities in this authored Tuesday, not Dele’s abilities",
    "interpersonal caution":"they do not follow one fixed pattern or establish a cause",
    "temporal caution":"other people and other weeks can differ",
    "debrief source caution":"This fictional room cannot confirm what Dele communicated at his door",
    "Saturday variation":"Saturday differed: a faint invitation to paint returned",
    "individual variation":"severity and course of any one experience cannot be inferred from a diagnosis",
    "Wren narrative":"Wren completes an ordinary task but says it does not quite feel like her action",
    "Wren reality-testing caution":"not a measure of anyone’s reality testing",
    "Wren agency caution":"they do not measure how someone’s body works",
    "Wren visitor consent":"Ask if she wants something cold to hold",
    "Ilse scene scope":"not a necessary symptom, cause, or path toward a delusion",
    "Ilse trust caution":"one phone call cannot show what caused Ilse’s experience",
    "Ilse belief caution":"Neither this scene nor a diagnosis determines what beliefs a person will form",
    "Ilse visitor consent":"Ask where she would like you to sit",
    "Ilse debrief":"A person’s own account and preferences are essential",
    "Pacing local":"Local-only playtest timing. No server calls, storage, countdown, or scoring.",
    "Pacing panel":"Playtest timing (local to this tab)",
}
outdated=[
    "Dele lost no one.",
    "nothing at all can show up as inviting.",
    "Other people are what make a situation look changeable, so when connection drops out",
    "D.debrief.point = D.debrief.point.replace('This flat shows'",
    "Wren holds no false beliefs.",
    "A delusion makes sense only inside a changed world like this one.",
    "Trust in other people normally runs in the background and keeps the ordinary world in place.",
]
for file_label,text in [("source",source),("production",built)]:
    for label,marker in required.items():
        assert marker in text, f"{file_label} missing {label}"
    for marker in outdated:
        assert marker not in text, f"{file_label} retains obsolete categorical wording: {marker}"
    assert text.count("Saturday differed: a faint invitation") == 1, f"{file_label}: Saturday point unexpectedly duplicated"
    assert "window.LWClass={open:begin" in text, f"{file_label}: classroom route missing"
print("PASS 8.4.2: Dele, Wren, Ilse narrative constraints and local pacing scaffolding in source and dist")

# 8.4.3 remaining-resident source and production review markers.
markers = {
    "Tomas": "not a predictable recovery pattern",
    "Mika": "fictional composite policy scenario",
    "Walt": "does not settle comprehension, literacy, cognition",
    "Ruth": "Speech clarity alone cannot establish cognitive ability",
    "Kai": "does not measure sensory processing",
}
for label, text_body in [("source", source), ("production", built)]:
    for resident, marker in markers.items():
        assert marker in text_body, f"{label}: missing {resident} revision"
    for retired in ["grief as a process with a direction", "this flat takes no side on them", "That pattern looks like depression", "Your mouth works perfectly", "singing, closed for good", "Kai’s world was never emptied. It was overfilled."]:
        assert retired not in text_body, f"{label}: categorical text retained: {retired}"
print("PASS 8.4.3 remaining-resident desk edits in source and production")

for label, text_body in [("source", source), ("production", built)]:
    for cue in [
        "This is an authored cue, not a measure of ability.",
        "His word-finding difficulty does not explain the change by itself.",
        "During a group session, a client contributes less than usual.",
        "const focusAction=guide.contains(document.activeElement)",
    ]:
        assert cue in text_body, f"{label}: missing 8.5.0 classroom cue: {cue}"
    assert "Everything takes effort here." not in text_body, f"{label}: obsolete ability generalization"
print("PASS 8.5.0 classroom inference, mechanics caveat and keyboard guard")

for label, text_body in [("source",source),("production",built)]:
    for cue in [
        "Press and hold, or activate three times.",
        "role=\"status\" aria-live=\"polite\" aria-atomic=\"true\"",
        "This is an authored action, not a motor test.",
        "if(!t.dataset.held){ t.dataset.taps=",
    ]:
        assert cue in text_body, f"{label}: missing heavy-action accessibility cue: {cue}"
    assert "if(e.detail===0) holdStart(t)" not in text_body, f"{label}: inaccessible delayed keyboard activation retained"
print("PASS 8.5.1 keyboard/pointer repeated-input accessibility constraints")
