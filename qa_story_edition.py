"""Story edition smoke, consent handoff, ending and edition isolation."""
import os
import shutil
from pathlib import Path
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
URL = urljoin(BASE, "story.html?noopening=1")
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
OUT = Path(os.environ.get("BF_TEST_ARTIFACTS", "qa-artifacts"))
OUT.mkdir(parents=True, exist_ok=True)

def check(browser, width, height):
    ctx = browser.new_context(viewport={"width":width,"height":height}, reduced_motion="reduce",
                              is_mobile=width<600, has_touch=width<600)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        page.goto(BASE, wait_until="load")
        page.get_by_role("button", name="Start the guided story").wait_for()
        page.evaluate("localStorage.setItem('lifeworld.v1', '{}')")
        page.goto(URL, wait_until="load")
        page.get_by_role("button", name="Begin story", exact=True).wait_for()
        assert not page.locator("#mTitle").get_by_text("Guided classroom story").count()
        page.screenshot(path=str(OUT / f"story-title-{width}.png"))
        page.get_by_role("button", name="Begin story", exact=True).click()
        page.wait_for_function("LWClass.stage==='noor' && LW.S.flat.name==='Noor'")
        assert page.evaluate("['dice','heavyHold','moodSpeed','worldSwap','sealedLegacy'].every(k=>BFFlags.blocked(k))")
        assert not page.locator("#clGuide .cl-progress").count()
        assert not page.locator("#clOverlay textarea").count()
        page.screenshot(path=str(OUT / f"story-noor-{width}.png"))
        page.locator('#clGuide [data-cl="dele"]').click()
        page.locator('#clOverlay [data-cl="deledo"]').click()
        page.wait_for_function("LWDele.state.stage==='door'")
        page.locator('#dlMoves [data-dla="depart"]').click()
        page.wait_for_function("LWDele.state.stage==='ended'")
        assert not page.locator('#dlMoves [data-dla="revisit"]').count()
        page.locator('#dlMoves [data-dla="reflect"]').click()
        page.wait_for_function("LWClass.stage==='waltbridge'")
        assert page.evaluate("LWClass.state.deleOutcome==='left_note'")
        assert not page.locator('#clOverlay [data-cl="roomgo"]').count()
        page.locator('#clOverlay [data-cl="walt"]').click()
        page.locator('#encCard [data-encgo="knock"]').wait_for()
        page.screenshot(path=str(OUT / f"story-walt-{width}.png"))
        # Controller completion bridge only. Original encounter QA exercises dialogue.
        page.evaluate("LWClass.toFinal()")
        page.get_by_role("heading", name="Outside again").wait_for()
        assert not page.locator("#clOverlay textarea").count()
        assert not page.locator('#clOverlay [data-cl="debrief"]').count()
        page.locator("#clOverlay details summary").click()
        assert "Ratcliffe" in page.locator("#clOverlay details").inner_text()
        page.screenshot(path=str(OUT / f"story-ending-{width}.png"))
        page.locator('#clOverlay [data-cl="end"]').click()
        assert page.evaluate("!LWClass.active && localStorage.getItem('lifeworld.v1')==='{}'")
        page.get_by_role("button", name="A different Saturday · Leena").click()
        page.locator("#bf-leena-dialog[open]").wait_for()
        assert page.get_by_role("button", name="Return to menu").is_visible()
        page.get_by_role("button", name="Return to menu").click()
        assert page.get_by_role("button", name="Begin story", exact=True).is_visible()
        assert not errors, errors
    finally:
        ctx.close()

if __name__ == "__main__":
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=CHROME, args=["--no-sandbox"])
        try:
            for width,height in ((390,844),(820,1180),(1440,900)):
                check(browser,width,height)
                print(f"Story edition {width}x{height} PASS",flush=True)
        finally:
            browser.close()
