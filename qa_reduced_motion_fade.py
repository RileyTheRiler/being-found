"""Actual guided Noor front-door timing under prefers-reduced-motion.

This audit intentionally exercises the available room action and the visible
Step outside control, not a direct call to the internal fade() function.
Presentation-only fades must not block reduced-motion input; the normal paced
presentation remains. No branch decisions or consent states are bypassed.
"""
import os
import re
import shutil
from time import perf_counter
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")


def check(browser, reduced):
    ctx=browser.new_context(viewport={"width":1440,"height":900},
        reduced_motion="reduce" if reduced else "no-preference")
    page=ctx.new_page()
    errs=[]
    page.on("pageerror",lambda error: errs.append(str(error)))
    try:
        page.goto(URL + ("&" if "?" in URL else "?") + "noopening=1",wait_until="load")
        page.get_by_role("button",name="Start the guided story").click()
        page.get_by_role("button",name="Enter Noor’s room").click()
        page.wait_for_function("window.LWClass?.stage==='noor'")
        assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches") == reduced
        page.locator('#bf-room-nav [data-room="kitchen"]').click()
        page.locator('.pin[data-obj="door"]').click()
        opts=page.locator('#bubbles .bub')
        labels=opts.all_text_contents()
        print("Noor real door action options:",labels,flush=True)
        door=opts.filter(has_text="Go out and see what the day has")
        assert door.count()==1, ("Authored door action not available",labels)
        door.click()
        page.locator('[data-walk="out"]').wait_for(state="visible",timeout=45000)
        assert page.evaluate("LWClass.stage==='noor' && LW.S.place==='home'")
        t0=perf_counter()
        page.locator('[data-walk="out"]').click()
        page.wait_for_function("LW.S.place==='street'",timeout=7000)
        mid=perf_counter()-t0
        page.wait_for_function("!document.querySelector('#fade')?.classList.contains('on') && LW.S.busyWalk===false",timeout=7000)
        total=perf_counter()-t0
        assert page.evaluate("LWClass.stage==='noor' && LWClass.active"),"Classroom route was lost"
        assert not errs,errs
        print(f"Measured guided Noor outside fade: reduced={reduced}, midway={mid:.3f}s, completed={total:.3f}s",flush=True)
        if reduced:
            assert mid < .48 and total < .85, ("Presentation fade still waits under reduced motion",mid,total)
        else:
            assert mid > .52 and total > 1.1, ("Ordinary presentation pacing changed",mid,total)
    finally:
        ctx.close()


if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        try:
            check(browser,True)
            check(browser,False)
        finally:
            browser.close()
    print("GUIDED OUTSIDE FADE AUDIT PASSED")
