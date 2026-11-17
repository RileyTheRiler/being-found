"""Being Found browser smoke tests. Run after `npm run build` and while dist is served."""
import json
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
OUT = Path(os.environ.get("BF_TEST_ARTIFACTS", "qa-artifacts"))
OUT.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
SIZES = [
    ("phone-small", 360, 640, True),
    ("phone", 390, 844, True),
    ("tablet-portrait", 820, 1180, True),
    ("tablet-landscape", 1180, 820, True),
    ("desktop", 1440, 900, False),
]

def state(page):
    return page.evaluate("""() => {
      const nav=document.querySelector('#bf-room-nav');
      const roomButtons=[...(nav?.querySelectorAll('button[data-room]')||[])];
      const active=roomButtons.filter(b=>b.classList.contains('active')||
           b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true');
      const scene=document.querySelector('#scene');
      const overflow=document.documentElement.scrollWidth-innerWidth;
      return {
        mode:window.LW?.S?.mode||null,
        flat:window.LW?.S?.flat?.name||null,
        navCount:document.querySelectorAll('#bf-room-nav').length,
        rooms:roomButtons.map(b=>b.dataset.room),
        active:active.map(b=>b.dataset.room),
        room:window.BFRoom?.selected||null,
        sceneWidth:scene?.getBoundingClientRect().width||0,
        bodyWidth:document.documentElement.scrollWidth,
        windowWidth:innerWidth, overflow
      };
    }""")

def run_case(browser, name, width, height, touch):
    ctx=browser.new_context(
        viewport={"width":width,"height":height},
        has_touch=touch,
        is_mobile=touch and min(width,height)<600,
        reduced_motion="reduce",
    )
    page=ctx.new_page()
    errors=[]
    page.on("pageerror", lambda e:errors.append(str(e)))
    result={"viewport":f"{width}x{height}"}
    try:
        page.goto(URL, wait_until="load",timeout=30000)
        page.wait_for_timeout(450)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.get_by_role("button", name="Start the guided story").click(timeout=8000)
        page.get_by_role("button", name="Enter Noor’s room").click(timeout=8000)
        page.wait_for_timeout(700)
        before=state(page)
        result["initial"]=before
        assert before["mode"]=="play",before
        assert before["sceneWidth"]>100,before
        assert before["navCount"]==1,before
        assert len(before["rooms"])==3,before
        assert before["overflow"]<=2,before
        assert len(before["active"])<=1,before
        assert not errors,errors

        kitchen=page.locator('#bf-room-nav [data-room="kitchen"]')
        kitchen.click(timeout=8000)
        page.wait_for_timeout(450)
        after=state(page)
        result["kitchen"]=after
        assert len(after["active"])<=1,after
        assert after["room"]=="kitchen",after
        assert after["overflow"]<=2,after
        assert not errors,errors

        page.locator('.pin[data-obj="stove"]').click(timeout=8000)
        page.wait_for_timeout(350)
        actions=page.locator('#bubbles button.bub:visible')
        result["visibleActions"]=actions.count()
        assert actions.count()>=1,result
        # The open action sheet must keep at least one primary choice reachable.
        btn=actions.first
        rect=btn.bounding_box()
        assert rect and rect["height"]>=40,result
        assert not errors,errors

        page.screenshot(path=str(OUT/f"{name}-action.png"))
        result["status"]="PASS"
    except Exception as exc:
        result["status"]="FAIL"
        result["error"]=str(exc)
        try:
            page.screenshot(path=str(OUT/f"{name}-failure.png"))
        except Exception:
            pass
    finally:
        result["pageErrors"]=errors
        print(json.dumps(result,ensure_ascii=False),flush=True)
        ctx.close()
    return result["status"]=="PASS"

if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(
            headless=True,
            executable_path=CHROME if CHROME else None,
            args=["--no-sandbox"]
        )
        results=[run_case(browser,*size) for size in SIZES]
        browser.close()
    if not all(results):
        raise SystemExit(1)
    print("ALL SMOKE TESTS PASSED",flush=True)
