"""8.5.3 reduced-motion transcript responsiveness on the consent-safe guided route.

Presentation-only Walt line dwell may be skipped. Walt's actual word-search
silences, choices and skip control must remain available. Browser QA only.
Run against a built game served on port 8770 (or BF_TEST_URL).
"""
import os
import shutil
from time import perf_counter
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
URL = BASE + ("&" if "?" in BASE else "?") + "noopening=1"
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")


def enter_walt(page, phone):
    page.goto(URL, wait_until="load")
    page.get_by_role("button", name="Start the guided story").click()
    page.get_by_role("button", name="Enter Noor’s room").click()
    page.wait_for_function("window.LWClass?.stage==='noor'")
    skip = page.locator('#clGuide .cl-guide-skip[data-cl="dele"]')
    if phone and not skip.is_visible():
        page.locator("#bf-guide-toggle").click()
    skip.click()
    page.locator('#clOverlay [data-cl="deledo"]').click()
    page.wait_for_function("window.LWDele?.state?.stage==='door'")
    # This is Dele's legitimate boundary: leave a note without entering.
    page.locator('#dlMoves [data-dla="depart"]').click()
    page.wait_for_function("window.LWDele?.state?.stage==='ended'")
    page.locator('#dlMoves [data-dla="reflect"]').click()
    page.locator('#dlCard [data-dlu="note"]').click()
    page.locator('#dlCard [data-dlu="classRoom"]').click()
    page.wait_for_function("window.LWClass?.stage==='waltbridge'")
    assert page.evaluate("window.LWClass.state.deleOutcome==='left_note'")
    assert not page.evaluate("window.LWClass.state.paceMarks.some(x=>x.stage==='room')")
    page.locator('#clOverlay [data-cl="walt"]').click()
    page.wait_for_function("window.LWClass?.stage==='walt'")
    page.evaluate("() => { LWEncounter.force='fresh'; LWEncounter.forceContext='goals'; }")
    assert page.locator('#encCard [data-encgo="knock"]').is_visible()


def check(browser, width, height, reduced, phone=False):
    context = browser.new_context(viewport={"width": width, "height": height},
        reduced_motion="reduce" if reduced else "no-preference",
        has_touch=phone, is_mobile=phone)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        enter_walt(page, phone)
        t0 = perf_counter()
        page.locator('#encCard [data-encgo="knock"]').click()
        if reduced:
            page.wait_for_function("!!window.LWEncounter?.state?.P", timeout=2500)
            elapsed = perf_counter() - t0
            assert elapsed < 2.5, ("Reduced motion still blocks first action on line-dwell timers", elapsed)
            assert page.locator("#encLog .enc-l").count() >= 3, "Narration missing from transcript"
            assert page.locator('#encMoves [data-encmv="help"]').is_visible(), "Walt choice buttons missing"
            assert page.locator("#encSkip").is_visible(), "Walt's voluntary skip control missing"
            # Reduced motion must NOT silently resolve Walt's word-finding pause.
            before = page.evaluate("() => ({t:LWEncounter.state.P.t,first:LWEncounter.state.P.first,skipped:LWEncounter.state.P.skipped})")
            page.wait_for_timeout(240)
            after = page.evaluate("() => ({t:LWEncounter.state.P.t,first:LWEncounter.state.P.first,skipped:LWEncounter.state.P.skipped})")
            assert before["first"] is None and after["first"] is None, (before, after)
            assert not after["skipped"] and 0 <= after["t"] < 3.2, (before, after)
            page.locator("#encSkip").click()
            assert page.evaluate("window.LWEncounter.state?.P?.skipped===true"), "Skip choice no longer controls the authored wait"
        else:
            # Ordinary presentation still has a deliberate per-line reading pace.
            page.wait_for_timeout(900)
            assert page.evaluate("window.LWEncounter.state?.reading===true && !window.LWEncounter.state?.P"), "Normal narration lost its pacing"
            page.locator("#encLog").click()  # Existing user-controlled narration advance.
            page.wait_for_function("!!window.LWEncounter?.state?.P", timeout=3000)
            assert page.locator("#encSkip").is_visible()
        assert not errors, errors
        print(f"PASS: {width}x{height} reduced_motion={reduced}, Walt transcript and consent-safe route", flush=True)
    finally:
        context.close()


if __name__ == "__main__":
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=CHROME, args=["--no-sandbox"])
        try:
            check(browser, 390, 844, True, phone=True)
            check(browser, 1440, 900, True)
            check(browser, 1440, 900, False)
        finally:
            browser.close()
