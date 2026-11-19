"""Guided-route control parity regression for 8.5.2B.

Checks playable behavior with the real classroom CSS state, including a saved
dice preference still enabled. The Dele flat is forced *only for this test*;
the classroom narrative does not grant the player entry after a visit.
"""
import os
import shutil
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")


def check(browser, width, height):
    ctx = browser.new_context(viewport={"width":width, "height":height},
        is_mobile=width<600, has_touch=width<600, reduced_motion="reduce")
    page = ctx.new_page()
    errors=[]
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        page.goto(URL, wait_until="load")
        page.wait_for_function("!!window.LWClass && !!window.BFFlags && !!window.BFSkillChecks", timeout=15000)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.evaluate("() => { LWClass.open(); LWClass.dev.stageNoor(); BFSkillChecks.setEnabled(true); }")
        assert page.evaluate("document.body.classList.contains('cl-route')")
        values=page.evaluate("() => ({dice:BFFlags.dice,heavy:BFFlags.heavyHold,speed:BFFlags.moodSpeed,sealed:BFFlags.sealedLegacy})")
        assert values == {"dice":False,"heavy":False,"speed":False,"sealed":False},values
        assert page.evaluate("getComputedStyle(document.querySelector('#atPillTop')).display")=="none"
        page.locator('#bf-room-nav [data-room="kitchen"]').click()
        page.locator('.pin[data-obj="stove"]').click()
        option=page.locator('#bubbles .bub').first
        option.wait_for(state="visible")
        option.click()
        assert page.locator('#bf-check').is_hidden(), "Noor's action opened dice"
        page.evaluate("() => { LW.closeModals(); LW.startFlat(2); }")
        page.locator('#bf-room-nav [data-room="kitchen"]').click()
        page.locator('.pin[data-obj="stove"]').click()
        heavy=page.locator('#bubbles .bub.s-heavy').first
        heavy.wait_for(state="visible")
        assert "Takes longer" in (heavy.get_attribute("aria-description") or "")
        heavy.focus()
        heavy.press("Enter")
        assert page.evaluate("LW.S.menu === null"), "One Enter did not activate a guided heavy choice"
        assert page.locator('#bf-check').is_hidden(), "Guided heavy choice opened dice"
        assert page.locator('#bubbles .bub.holding').count()==0
        page.locator('#bf-room-nav [data-room="living"]').click()
        page.locator('.pin[data-obj="door"]').click()
        sealed=page.locator('#bubbles .bub.s-sealed').first
        sealed.wait_for(state="visible")
        css=sealed.evaluate("""el => {
          const s=getComputedStyle(el),lab=getComputedStyle(el.querySelector('.lab'));
          return {border:s.borderTopStyle,line:lab.textDecorationLine,tag:el.querySelector('.tag')?.textContent.trim()};
        }""")
        assert css["border"]=="solid" and css["line"]=="none" and css["tag"]=="not today",css
        sealed.click()
        assert page.evaluate("LW.S.menu === null"), "Sealed option was not actionable"
        assert not errors,errors
        print(f"{width}x{height} PASS guided input parity",flush=True)
    finally:
        ctx.close()


if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        check(browser,390,844)
        check(browser,1440,900)
        browser.close()
    print("GUIDED ROUTE CAPABILITY REGRESSION PASSED",flush=True)
