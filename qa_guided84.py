"""Being Found 8.4 guided narrative regression across a narrow phone and desktop.

Exercises the authored sequence, a voluntary silence at Dele's door, the
transition into the fictional day, the Walt handoff and the final reflection.
The full Walt conversation is covered separately by the encounter tests.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
OUT = Path(os.environ.get("BF_TEST_ARTIFACTS", "qa-artifacts"))
OUT.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

def state(page):
    return page.evaluate("""() => ({
      chapter:window.LWClass?.stage, resident:window.LW?.S?.flat?.name,
      encounter:window.LWDele?.state?.stage,
      modal:!document.querySelector('#clOverlay')?.hidden,
      beatVisible:!document.querySelector('#clChapterBeat')?.hidden,
      overflow:document.documentElement.scrollWidth-innerWidth
    })""")

def check(browser, label, width, height, mobile):
    ctx = browser.new_context(viewport={"width":width,"height":height},
        has_touch=mobile, is_mobile=mobile, reduced_motion="reduce")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    try:
        page.goto(URL, wait_until="load")
        page.wait_for_timeout(500)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.get_by_role("button", name="Start the guided story").click()
        assert page.locator('#clOverlay').is_visible()
        page.get_by_role("button", name="Enter Noor’s room").click()
        page.wait_for_function("window.LWClass?.stage==='noor'")
        s = state(page)
        assert s["resident"] == "Noor" and not s["beatVisible"],s
        assert s["overflow"] <= 2,s
        if mobile:
            page.locator('#clGuide [data-cl="guideshow"]').click()
        page.locator('#clGuide .cl-guide-skip[data-cl="dele"]').click()
        assert "next door" in page.locator("#clOverlay h2").inner_text().lower()
        page.locator('#clOverlay [data-cl="deledo"]').click()
        page.wait_for_function("window.LWDele?.state?.stage==='door'")
        assert page.locator('#dlHall').is_visible(), state(page)
        assert page.locator('#dlCard').is_hidden(), "Guided encounter must start at the door, not the referral explanation"
        assert page.locator('#dlMoves [data-dla="askenter"]').is_visible()
        page.locator('#dlMoves [data-dla="askenter"]').click()
        page.wait_for_function("window.LWDele?.state?.stage==='inside'")
        page.locator('#dlMoves [data-dla="quiet"]').click()
        page.wait_for_function("window.LWDele?.state?.stage==='silence'")
        assert page.locator('#dlSkip').is_visible()
        page.locator('#dlSkip').click()
        page.wait_for_function("['inside','ended'].includes(window.LWDele?.state?.stage)")
        if state(page)["encounter"] == "inside":
            page.locator('#dlMoves [data-dla="leave"]').click()
        page.wait_for_function("window.LWDele?.state?.stage==='ended'")
        page.locator('#dlMoves [data-dla="reflect"]').click()
        assert "What Dele communicated" in page.locator('#dlCard').inner_text()
        page.locator('#dlCard [data-dlu="note"]').click()
        page.locator('#dlCard [data-dlu="classRoom"]').click()
        page.wait_for_function("window.LWClass?.stage==='room'")
        assert "A room cannot confirm" in page.locator('#clOverlay h2').inner_text()
        page.locator('#clOverlay [data-cl="roomgo"]').click()
        assert state(page)["resident"] == "Dele", state(page)
        if mobile:
            page.locator('#clGuide [data-cl="guideshow"]').click()
        page.locator('#clGuide .cl-guide-skip[data-cl="waltbridge"]').click()
        assert "different possibility" in page.locator('#clOverlay h2').inner_text().lower()
        page.locator('#clOverlay [data-cl="walt"]').click()
        page.wait_for_function("window.LWClass?.stage==='walt'")
        assert page.locator('#enc').is_visible()
        # The Walt conversation is already covered by its own regression suite.
        # This invokes its public classroom completion bridge to test the debrief.
        page.evaluate("window.LWClass.toFinal()")
        page.wait_for_function("window.LWClass?.stage==='complete'")
        assert "from the outside" in page.locator('#clOverlay h2').inner_text().lower()
        answers = page.locator('#clOverlay textarea[data-clanswer="post"]')
        assert answers.count() == 3
        prompts = page.locator('#clOverlay .cl-questions label').all_inner_texts()
        assert "observe" in prompts[0].lower() and "infer" in prompts[1].lower(),prompts
        answers.nth(0).fill("The person spoke less during this session.")
        answers.nth(1).fill("I cannot know why from that behavior.")
        answers.nth(2).fill("Ask about preferred communication supports.")
        page.locator('#clOverlay .cl-phenomenology summary').click()
        assert "Ratcliffe" in page.locator('#clOverlay .cl-phenomenology').inner_text()
        assert "not simply a named emotion" in page.locator('#clOverlay .cl-phenomenology').inner_text()
        assert state(page)["overflow"] <= 2,state(page)
        page.screenshot(path=str(OUT / (label + "-guided84-final.png")))
        page.locator('#clOverlay [data-cl="debrief"]').click()
        assert "no answer key" in page.locator('#clOverlay').inner_text().lower()
        page.locator('#clOverlay [data-cl="final"]').click()
        assert answers.nth(0).input_value() == "The person spoke less during this session."
        page.locator('#clOverlay [data-cl="end"]').click()
        assert page.evaluate("!LWClass.active && document.querySelector('#clOverlay').hidden && !document.querySelector('#app').inert")
        assert not errors,(label,errors)
        print(label,"PASS: guided stages, Dele silence, reflection and responsive UI",flush=True)
    except Exception:
        page.screenshot(path=str(OUT / (label + "-guided84-fail.png")))
        raise
    finally:
        ctx.close()

def check_beat(browser):
    ctx = browser.new_context(viewport={"width":1440,"height":900}, reduced_motion="no-preference")
    page = ctx.new_page()
    try:
        page.goto(URL,wait_until="load")
        page.wait_for_timeout(500)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.get_by_role("button",name="Start the guided story").click()
        page.get_by_role("button",name="Enter Noor’s room").click()
        assert page.evaluate("!document.querySelector('#clChapterBeat').hidden")
        assert page.evaluate("getComputedStyle(document.querySelector('#clChapterBeat')).pointerEvents==='none'")
        page.wait_for_timeout(1450)
        assert page.evaluate("document.querySelector('#clChapterBeat').hidden")
        print("chapter beat PASS: visible, nonblocking, automatically dismissed",flush=True)
    finally:
        ctx.close()

if __name__ == "__main__":
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True,executable_path=CHROME,
            args=["--no-sandbox"])
        check(browser,"phone-small",360,640,True)
        check(browser,"desktop",1440,900,False)
        check_beat(browser)
        browser.close()
    print("ALL GUIDED 8.4 REGRESSIONS PASSED",flush=True)
