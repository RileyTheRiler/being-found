"""One local command for the existing Being Found regression suite.

Usage:
    npm run qa                     # builds, starts local server if needed, tests
    python3 qa_all.py              # tests an existing dist/ (build first)
    python3 qa_all.py --list       # explicit manifest, no browser required

This manifest deliberately excludes qa_all.py itself and does not glob qa_*.py.
It runs the same scripts as .github/workflows/quality.yml, plus the flags check.
"""
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
PY = sys.executable

CASES = (
    ("pilot self-test", (PY, "pilot_summary.py", "--self-test")),
    ("pilot empty template", (PY, "pilot_summary.py", "pilot/observations.csv")),
    ("8.5.2A flag policy", ("node", "qa_flags.js")),
    ("JavaScript parser", (PY, "qa_js_syntax.py")),
    ("editorial guards", (PY, "qa_editorial.py")),
    ("Wren and Ilse", (PY, "qa_wren_ilse.py")),
    ("remaining residents", (PY, "qa_remaining_scenes.py")),
    ("guided classroom", (PY, "qa_guided84.py")),
    ("guided keyboard", (PY, "qa_access85.py")),
    ("heavy-input parity", (PY, "qa_heavy_access.py")),
    ("five viewport smoke", (PY, "qa_smoke.py")),
    ("character motion and sofa", (PY, "qa_character_motion.py")),
    ("phone pickup and return", (PY, "qa_phone_motion.py")),
    ("staged sofa and work animation", (PY, "qa_physical_actions.py")),
    ("menu checks", (PY, "menu_check.py")),
    ("save and resume", (PY, "qa_save_resume.py")),
    ("Reflect focus", (PY, "qa_focus.py")),
    ("opt-in audio", (PY, "qa_audio.py")),
    ("cross-flat stove", (PY, "qa_flats_stove.py")),
    ("state preservation", (PY, "test_prop_states.py")),
    ("story / follow-up", (PY, "e2e_sync.py", "390x844")),
    ("later story", (PY, "test_later.py", "390x844")),
    ("Dele encounter", (PY, "dele_check.py")),
    ("visits", (PY, "visit_check.py")),
)


def reachable(url):
    try:
        with urllib.request.urlopen(url, timeout=1.0) as response:
            return response.status == 200
    except (OSError, urllib.error.URLError, TimeoutError):
        return False


def serve_if_needed():
    url = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
    if reachable(url):
        return None
    parsed = urlsplit(url)
    if parsed.scheme != "http" or parsed.hostname not in {"localhost", "127.0.0.1"}:
        raise RuntimeError("BF_TEST_URL is unreachable; automatic server requires a local HTTP URL")
    if not (ROOT / "dist/index.html").is_file():
        raise RuntimeError("dist/index.html missing: run npm run build before qa_all.py")
    port = parsed.port or 80
    server = subprocess.Popen(
        [PY, "-m", "http.server", str(port), "--bind", "127.0.0.1",
         "--directory", str(ROOT / "dist")],
        cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    for _ in range(40):
        if reachable(url):
            return server
        if server.poll() is not None:
            raise RuntimeError("Local game server exited before becoming ready")
        time.sleep(0.15)
    server.terminate()
    raise RuntimeError("Local game server did not become ready")


def main():
    if len(sys.argv) > 2 or (len(sys.argv) == 2 and sys.argv[1] != "--list"):
        print("Usage: python3 qa_all.py [--list]", file=sys.stderr)
        return 2
    if len(sys.argv) == 2:
        for label, cmd in CASES:
            print(f"{label}: {' '.join(cmd)}")
        return 0

    if not (ROOT / "dist/index.html").is_file():
        print("dist/ missing; first run npm run build", file=sys.stderr)
        return 2
    try:
        server = serve_if_needed()
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 2
    passed = 0
    try:
        for label, cmd in CASES:
            print(f"\n[{passed + 1}/{len(CASES)}] {label}", flush=True)
            result = subprocess.run(cmd, cwd=ROOT, check=False)
            if result.returncode:
                print(f"FAILED: {label} (exit {result.returncode})", file=sys.stderr)
                return result.returncode
            passed += 1
        print(f"\nAll {passed}/{len(CASES)} manifest cases passed.")
        return 0
    finally:
        if server is not None:
            server.terminate()
            try:
                server.wait(timeout=3)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()


if __name__ == "__main__":
    sys.exit(main())
