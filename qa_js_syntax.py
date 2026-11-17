"""Parse source and built inline JS (and built JS assets) before browser QA.

A production HTML build can succeed even if an author's JS object literal
has a missing comma, leaving the game unable to initialize in the browser.
"""
from pathlib import Path
import re
import subprocess
import tempfile

scripts=[]
for path in [Path("src/index.html"),Path("dist/index.html")]:
    html=path.read_text(encoding="utf-8")
    for i,block in enumerate(re.findall(r"<script\b[^>]*>([\s\S]*?)</script>",html,flags=re.I),start=1):
        if block.strip():
            scripts.append((f"{path} inline script #{i}",block))
for file in Path("dist").rglob("*.js"):
    scripts.append((str(file),file.read_text(encoding="utf-8")))

assert scripts,"No JavaScript found to check"
for label,body in scripts:
    with tempfile.NamedTemporaryFile(mode="w",suffix=".js",encoding="utf-8",delete=True) as tmp:
        tmp.write(body)
        tmp.flush()
        proc=subprocess.run(["node","--check",tmp.name],text=True,capture_output=True)
    assert proc.returncode==0,f"{label}: invalid JavaScript\n{proc.stderr}"
print(f"PASS: {len(scripts)} source and built JavaScript blocks parse")
