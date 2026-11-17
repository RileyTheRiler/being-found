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
}
outdated=[
    "Dele lost no one.",
    "nothing at all can show up as inviting.",
    "Other people are what make a situation look changeable, so when connection drops out",
    "D.debrief.point = D.debrief.point.replace('This flat shows'",
]
for file_label,text in [("source",source),("production",built)]:
    for label,marker in required.items():
        assert marker in text, f"{file_label} missing {label}"
    for marker in outdated:
        assert marker not in text, f"{file_label} retains obsolete categorical wording: {marker}"
    assert text.count("Saturday differed: a faint invitation") == 1, f"{file_label}: Saturday point unexpectedly duplicated"
    assert "window.LWClass={open:begin" in text, f"{file_label}: classroom route missing"
print("PASS 8.4.1: authored Dele notes, variability, scene separation and Saturday debrief present in source and dist")
