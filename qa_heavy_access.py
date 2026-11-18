"""Repeated-input action access: keyboard, pointer and announced feedback.

Preserves the authored hold/three-activation rule. This browser check is not
a substitute for real screen-reader, motor-access or lived-experience review.
"""
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

def check(browser, name, width, height, keyboard):
    context = browser.new_context(viewport={"width":width,"height":height},
        is_mobile=width<600, has_touch=width<600, reduced_motion="reduce")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        page.goto(URL, wait_until="load")
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.wait_for_function("!!window.LW && typeof window.LW.startFlat === 'function' && !!window.BFSkillChecks", timeout=10000)
        assert page.evaluate("window.BFSkillChecks.state.enabled === true"), name + ": baseline skill checks should be enabled"
        # Explicitly choose the player's supported Story attempts: Off setting.
        # With checks on, this action opens the optional dice sheet instead
        # of following the native hold/three-activation route.
        page.evaluate("window.BFSkillChecks.setEnabled(false)")
        assert page.evaluate("window.BFSkillChecks.state.enabled === false"), name + ": could not disable Story attempts"
        page.wait_for_timeout(300)
        page.evaluate("() => { LW.closeModals(); LW.startFlat(2); }")
        page.locator('#bf-room-nav [data-room="kitchen"]').click(timeout=8000)
        page.locator('.pin[data-obj="stove"]').click(timeout=8000)
        heavy = page.locator('#bubbles button.bub.s-heavy').first
        heavy.wait_for(state="visible",timeout=8000)
        assert "Activate three times" in (heavy.get_attribute("aria-description") or ""), name + ": action explanation missing"
        assert page.locator("#toast").get_attribute("role") == "status", name + ": toast is not announced"
        if keyboard: heavy.focus()
        for number in (1,2,3):
            if keyboard: heavy.press("Enter")
            else: heavy.click()
            if number < 3:
                assert heavy.is_visible(), name + ": action fired before third activation"
                assert heavy.get_attribute("data-taps") == str(number), (name,number,heavy.get_attribute("data-taps"))
                assert "authored cue" in (page.locator("#toast").text_content() or ""), name + ": inaccessible explanation"
            else:
                assert page.evaluate("window.LW.S.menu === null"), name + ": third activation did not choose"
                assert not page.locator("#bubbles").evaluate("(el) => el.classList.contains('on')"), name + ": action menu remained open"
        if keyboard:
            assert page.evaluate("document.activeElement?.matches('.pin[data-obj=stove]')"), name + ": focus not restored to room object"
        assert not errors, (name,errors)
        print(name, "PASS: 3 deliberate activations, accessible cue and menu return",flush=True)
    finally:
        context.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        check(browser,"desktop-keyboard",1440,900,True)
        check(browser,"phone-pointer",390,844,False)
        browser.close()
    print("ALL HEAVY ACTION ACCESS TESTS PASSED",flush=True)
