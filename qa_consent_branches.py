"""8.5.2B Dele consent and early-depart regression.

Covers forced encounter contexts, Dele/visitor exits, and Walt handoff.
No pilot, capability or accessibility outcome can be inferred from this test.
"""
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

CASES = (
    ("early-depart", "boundary", "depart", "left_note"),
    ("visitor-leaves", "practical", "leave", "visitor_left"),
    ("Dele-sets-boundary", "boundary", "resident", "resident_ended"),
    ("horizon-natural-end", "horizon", "complete", "ended_without_account"),
    ("practical-natural-end", "practical", "complete", "ended_without_account"),
)


def check(browser, case, viewport):
    name, context, path, expected = case
    page_context = browser.new_context(
        viewport=viewport, is_mobile=viewport["width"] < 600,
        has_touch=viewport["width"] < 600, reduced_motion="reduce",
    )
    page = page_context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        page.goto(URL, wait_until="load")
        page.wait_for_function("!!window.LWClass && !!window.LWDele", timeout=15000)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.evaluate("(ctx) => { LWDele.forceContext = ctx; }", context)
        page.get_by_role("button", name="Start the guided story").click()
        # Branch matrix starts directly at the Dele chapter; qa_guided84
        # separately checks the player's full title -> Noor -> Dele path.
        page.evaluate("window.LWClass.dev.stageDele()")
        page.wait_for_function("window.LWDele?.state?.stage === 'door'")
        assert page.evaluate("LWDele.state.ctx") == context
        if path == "depart":
            page.locator('#dlMoves [data-dla="depart"]').click()
        else:
            page.locator('#dlMoves [data-dla="askenter"]').click()
            page.wait_for_function("window.LWDele?.state?.stage === 'inside'")
            if path == "leave":
                page.locator('#dlMoves [data-dla="leave"]').click()
            else:
                actions = ("ask", "choice", "help") if path == "resident" else ("ask", "choice", "plan", "help")
                for action in actions:
                    if page.evaluate("LWDele.state.stage") == "ended":
                        break
                    page.locator(f'#dlMoves [data-dla="{action}"]').click()
        page.wait_for_function("window.LWDele?.state?.stage === 'ended'", timeout=10000)
        actual = page.evaluate("LWDele.state.outcome")
        assert actual == expected, (name, expected, actual)
        assert page.locator('#dlMoves [data-dla="revisit"]').count() == 0, 'Guided scene offered immediate revisit'
        prior = page.evaluate('LWDele.history')
        assert prior and prior[-1]['outcome'] == expected and prior[-1]['context'] == context, (name, prior)
        page.locator('#dlMoves [data-dla="reflect"]').click()
        assert page.locator('#dlCard [data-dlu="revisit"]').count() == 0, 'Guided summary offered immediate revisit'
        page.evaluate('LWDele.dev.showRoom()')
        assert page.locator('#dlCard [data-dlu="revisit"]').count() == 0, 'Guided room offered immediate revisit'
        # Room's Return to note link is collapsed under More options.
        # Exercise the actual note state before continuing to its record.
        page.evaluate('LWDele.dev.showNote()')
        page.locator('#dlCard [data-dlu="reflect"]').click()
        page.locator('#dlCard [data-dlu="note"]').click()
        assert page.locator('#dlCard [data-dlu="classRoom"]').is_visible()
        # The classroom route must not silently offer Dele's private account.
        assert page.locator('#dlCard [data-dlu="account"]').count() == 0
        page.locator('#dlCard [data-dlu="classRoom"]').click()
        page.wait_for_function("LWClass?.stage === 'waltbridge'")
        assert page.evaluate("LWClass.state.deleOutcome") == expected
        assert page.evaluate("!LWClass.state.paceMarks.some(x => x.stage === 'room' || x.stage === 'roombridge')")
        assert not page.locator('#clOverlay [data-cl="roomgo"]').count()
        page.locator('#clOverlay [data-cl="walt"]').click()
        page.wait_for_function("LWClass?.stage === 'walt'")
        assert page.locator("#enc").is_visible(), name + ": Walt did not open"
        assert page.evaluate('LWDele.history') == prior, 'Walt handoff discarded encounter outcome'
        page.evaluate('(ctx) => {LWDele.open();LWDele.forceContext=ctx;LWDele.begin();}', context)
        assert page.evaluate('LWDele.history') == prior, 'begin() reset previous outcomes'
        page.locator('#dlMoves [data-dla="depart"]').click()
        assert len(page.evaluate('LWDele.history')) == len(prior)+1, 'Subsequent visit not appended'
        page.reload()
        page.wait_for_function('!!window.LWDele')
        assert len(page.evaluate('LWDele.history')) == len(prior)+1, 'Visit history not persisted through reload'
        assert not errors, (name, errors)
        print(f"{name} {viewport['width']}x{viewport['height']} PASS", flush=True)
    finally:
        page_context.close()


if __name__ == "__main__":
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=CHROME, args=["--no-sandbox"])
        for case in CASES:
            check(browser, case, {"width": 390, "height": 844})
            check(browser, case, {"width": 1440, "height": 900})
        browser.close()
    print("ALL 8.5.2B DELE CONSENT REGRESSIONS PASSED", flush=True)
