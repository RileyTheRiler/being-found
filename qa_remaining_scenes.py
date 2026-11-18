"""8.4.3 browser smoke for five remaining fictional narratives; not lived-experience validation."""
import os, shutil
from playwright.sync_api import sync_playwright

URL=os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
CHECKS=[(1,"Tomas","not a predictable recovery pattern"),
        (5,"Mika","fictional composite policy scenario"),
        (6,"Walt","does not settle comprehension, literacy, cognition"),
        (7,"Ruth","singing in her former way feels unavailable"),
        (8,"Kai","does not measure sensory processing")]

def check(browser,w,h):
    mobile=w<700
    context=browser.new_context(viewport={"width":w,"height":h},is_mobile=mobile,has_touch=mobile)
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    try:
        page.goto(URL,wait_until="load")
        page.wait_for_function("!!window.LW && typeof window.LW.startFlat==='function'",timeout=10000)
        page.evaluate("document.querySelector('#plSkip')?.click()")
        for idx,name,marker in CHECKS:
            page.evaluate("(i)=>{LW.closeModals();LW.startFlat(i);}",idx)
            info=page.evaluate("""() => {
              const f=LW.S.flat;
              return {name:f.name, scope:f.scope, intro:f.intro, caveat:f.caveat||'',
                text:JSON.stringify({phases:f.phases,debrief:f.debrief},(key,val)=>typeof val==='function'?undefined:val),
                overflow:document.documentElement.scrollWidth-innerWidth};
            }""")
            assert info["name"]==name,info
            assert marker in (info["scope"]+info["intro"]+info["caveat"]+info["text"]),(name,marker)
            assert info["overflow"]<=2,(name,info["overflow"])
        assert not errors,errors
        print(f"PASS {w}x{h}: Tomas/Mika/Walt/Ruth/Kai load without errors or overflow",flush=True)
    finally:
        context.close()

if __name__=="__main__":
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        check(browser,360,640)
        check(browser,1440,900)
        browser.close()
    print("ALL REMAINING NARRATIVE CHECKS PASSED",flush=True)
