"""Guided keyboard focus and reduced-motion regression (browser only, not screen-reader validation)."""
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

def check(browser, name, width, height, mobile):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        has_touch=mobile, is_mobile=mobile, reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        page.goto(URL, wait_until="load")
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.get_by_role("button", name="Start the guided story").click(timeout=8000)
        assert page.locator("#clOverlay").is_visible()
        assert page.evaluate("document.querySelector('#app').inert"), name + ": modal background not inert"
        # Wait for the authored modal heading-focus handoff before focusing a field.
        # Otherwise that pending 0-ms callback may steal focus between the
        # test's field.focus() and its delayed reduced-motion scroll.
        page.wait_for_function("document.activeElement?.matches('#clOverlay h2') === true", timeout=8000)
        page.locator("#clOverlay details.cl-journal").evaluate("(el) => { el.open = true; }")
        page.evaluate("""() => {
            window.__bfFieldScroll = [];
            const original = Element.prototype.scrollIntoView;
            Element.prototype.scrollIntoView = function(options) {
                if (this.matches?.('textarea[data-clanswer]')) window.__bfFieldScroll.push(options?.behavior);
                return original.call(this, options);
            };
        }""")
        page.locator('#clOverlay textarea[data-clanswer="pre"]').first.focus()
        page.wait_for_timeout(280)
        behaviors = page.evaluate("window.__bfFieldScroll")
        assert behaviors and behaviors[-1] == "auto", (name, "reduced-motion reflection scroll", behaviors)

        page.get_by_role("button", name="Enter Noor’s room").click(timeout=8000)
        page.wait_for_function("window.LWClass?.stage === 'noor'")
        assert not page.evaluate("document.querySelector('#app').inert"), name + ": app remained inert"
        assert page.locator("#clOverlay").is_hidden()
        assert page.evaluate("!document.activeElement?.closest('#clOverlay')"), name + ": focus in hidden modal"

        if mobile:
            toggle = page.locator("#bf-guide-toggle")
            assert toggle.is_visible(), name + ": guide toggle missing"
            toggle.click()
            assert toggle.get_attribute("aria-expanded") == "true"
            assert page.locator('#clGuide [data-cl="guideshow"]').is_visible()
            page.locator('#clGuide [data-cl="guideshow"]').press("Enter")
            assert page.evaluate("document.activeElement?.dataset?.cl === 'guidehide'"), name + ": guide expand lost keyboard focus"
        else:
            assert page.locator('#clGuide [data-cl="guidehide"]').is_visible(), name + ": desktop guide missing"

        page.locator('#clGuide [data-cl="guidehide"]').press("Enter")
        assert page.evaluate("document.activeElement?.dataset?.cl === 'guideshow'"), name + ": collapse lost keyboard focus"
        page.locator('#clGuide [data-cl="guideshow"]').press("Enter")
        assert page.evaluate("document.activeElement?.dataset?.cl === 'guidehide'"), name + ": reexpand lost keyboard focus"

        if mobile:
            toggle.click()
            assert toggle.get_attribute("aria-expanded") == "false"
            assert page.evaluate("document.activeElement?.id === 'bf-guide-toggle'"), name + ": toggle close lost keyboard focus"
        assert not errors, (name, errors)
        print(name, "PASS: keyboard guide fold, modal handoff and reduced-motion scroll", flush=True)
    finally:
        context.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME, args=["--no-sandbox"])
        check(browser, "phone", 390, 844, True)
        check(browser, "desktop", 1440, 900, False)
        browser.close()
    print("ALL 8.5 GUIDED ACCESSIBILITY REGRESSIONS PASSED", flush=True)
