"""8.4.2 Wren and Ilse authored narrative runtime regression.

This verifies text and state exposure on phone/desktop, not clinical accuracy.
"""
import os
import shutil
from playwright.sync_api import sync_playwright

URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

def check(browser, width, height):
    mobile=width<700
    ctx=browser.new_context(viewport={"width":width,"height":height},has_touch=mobile,is_mobile=mobile)
    page=ctx.new_page()
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    try:
        page.goto(URL,wait_until="load")
        page.wait_for_timeout(600)
        page.wait_for_function("!!window.LW && typeof window.LW.startFlat === 'function'",timeout=10000)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        for index,name in [(3,"Wren"),(4,"Ilse")]:
            page.evaluate("(i) => {window.LW.closeModals();window.LW.startFlat(i);}",index)
            data=page.evaluate("""() => ({
              name: window.LW.S.flat.name,
              scope: window.LW.S.flat.scope,
              intro: window.LW.S.flat.intro,
              notes: window.LW.S.flat.phases[0].goals.map(g=>g.note?.text || ''),
              point: window.LW.S.flat.debrief.point,
              overflow: document.documentElement.scrollWidth-innerWidth
            })""")
            assert data["name"]==name,data
            assert data["overflow"]<=2,data
            if name=="Wren":
                assert "invented person" in data["scope"],data
                assert "being here feels like" in data["intro"],data
                assert any("not a measure of anyone’s reality testing" in n for n in data["notes"]),data
                assert "from a tidy room" in data["point"],data
            else:
                assert "not a necessary symptom" in data["scope"],data
                assert any("one phone call cannot show" in n for n in data["notes"]),data
                assert "A person’s own account and preferences" in data["point"],data
        assert not errors,errors
        print(f"PASS {width}x{height}: Wren, Ilse scene text, no overflow/errors",flush=True)
    finally:
        ctx.close()

if __name__=="__main__":
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        check(browser,360,640)
        check(browser,1440,900)
        browser.close()
    print("ALL WREN/ILSE EDITORIAL REGRESSIONS PASSED",flush=True)
