"""Restore an existing Story Edition checkpoint through both public menus."""
import os
from urllib.parse import urljoin

from playwright.sync_api import expect, sync_playwright

URL = urljoin(os.getenv("BF_TEST_URL", "http://127.0.0.1:8770/index.html"), "story/index.html")
SAVE = "beingfound.story.save.v1"


def check(browser, beat, via_chapters):
    context = browser.new_context(reduced_motion="reduce")
    try:
        page = context.new_page()
        page.goto(URL)
        # Legacy v1 save from after leaving the flat. The street save also
        # carries the stair decision. Install once so reloads test actual writes.
        flags = {"leaveFlat": True, "hasSign": True}
        if beat == "street":
            flags["downstairs"] = True
        record = {"version": 1, "chapter": "noor", "from": beat, "state": {
            "flags": flags, "completed": ["prologue"], "notebook": ["about"], "log": [],
        }}
        page.evaluate("([key, save]) => localStorage.setItem(key, JSON.stringify(save))", [SAVE, record])
        page.evaluate("""() => {
            localStorage.setItem('lifeworld.v1', 'rooms-checkpoint');
            sessionStorage.setItem('lifeworld.v1', 'guided-checkpoint');
        }""")
        page.reload()
        if via_chapters:
            page.get_by_role("button", name="Chapters", exact=True).press("Enter")
            page.get_by_role("button", name="Resume", exact=True).press("Enter")
        else:
            page.get_by_role("button", name="Continue").press("Enter")

        target = "Stairs down" if beat == "hall" else "Mara"
        expect(page.locator("#hotspots").get_by_role("button", name=target, exact=True)).to_be_attached()
        restored = page.evaluate("key => JSON.parse(localStorage.getItem(key))", SAVE)
        assert restored["from"] == beat
        assert restored["state"]["flags"]["hasSign"]
        # Reload after the transition and confirm the next Continue still works.
        page.reload()
        page.get_by_role("button", name="Continue").click()
        expect(page.locator("#hotspots").get_by_role("button", name=target, exact=True)).to_be_attached()
        assert page.evaluate("localStorage.getItem('lifeworld.v1')") == "rooms-checkpoint"
        assert page.evaluate("sessionStorage.getItem('lifeworld.v1')") == "guided-checkpoint"
        print(f"PASS {beat} via {'Chapters' if via_chapters else 'Continue'} and reload")
    finally:
        context.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.getenv("BF_CHROME"))
        for checkpoint in ("hall", "street"):
            for chapters in (True, False):
                check(browser, checkpoint, chapters)
        browser.close()
