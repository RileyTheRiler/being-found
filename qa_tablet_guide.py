"""8.5.3 tablet Guide: scene stays unobstructed during orientation changes.

This is browser geometry/keyboard evidence; physical iPad and AT remain untested.
Run after npm ci, npm run build, and serving dist on localhost:8770.
"""
import os
import shutil
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
URL = BASE + ("&" if "?" in BASE else "?") + "noopening=1"
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")


def measure(page):
    return page.evaluate("""() => {
      const guide=document.querySelector('#clGuide');
      const dock=document.querySelector('#dock');
      const scene=document.querySelector('#scene');
      const result=document.querySelector('#result');
      const g=guide.getBoundingClientRect(),s=scene.getBoundingClientRect();
      const r=result.getBoundingClientRect();
      const overlaps=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
      const targets=[...guide.querySelectorAll('button')].filter(b=>
        getComputedStyle(b).display!=='none'&&b.getClientRects().length>0)
        .map(b=>({name:b.getAttribute('data-cl'),w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}));
      return {
        parent:guide.parentElement?.id, position:getComputedStyle(guide).position,
        sceneOverlap:overlaps(g,s),resultOverlap:overlaps(g,r),
        guideTop:g.top,sceneBottom:s.bottom,resultTop:r.top,
        overflow:document.documentElement.scrollWidth-innerWidth,
        targets,hasFold:!!guide.querySelector('[data-cl="guidehide"],[data-cl="guideshow"]')
      };
    }""")


def check():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        context=browser.new_context(viewport={"width":820,"height":1180},
            has_touch=True,is_mobile=False,reduced_motion="reduce")
        page=context.new_page()
        errors=[]
        page.on("pageerror",lambda error:errors.append(str(error)))
        try:
            page.goto(URL,wait_until="load")
            page.get_by_role("button",name="Start the guided story").click(timeout=8000)
            page.get_by_role("button",name="Enter Noor’s room").click(timeout=8000)
            page.wait_for_function("window.LWClass?.stage==='noor'")
            page.wait_for_function("document.querySelector('#clGuide')?.parentElement?.id==='dock'")
            portrait=measure(page)
            assert portrait["parent"]=="dock",("portrait Guide not in dock",portrait)
            assert portrait["position"]!="fixed",("portrait Guide floats over room",portrait)
            assert not portrait["sceneOverlap"],("portrait Guide obscures scene",portrait)
            assert not portrait["resultOverlap"],("portrait Guide obscures narrative",portrait)
            assert portrait["guideTop"]>=portrait["sceneBottom"]-2,("guide precedes scene",portrait)
            assert portrait["guideTop"]<portrait["resultTop"],("guide not before narrative",portrait)
            assert portrait["overflow"]<=2,("portrait horizontal overflow",portrait)
            assert portrait["hasFold"],("Guide cannot be collapsed",portrait)
            assert all(t["w"]>=43.5 and t["h"]>=43.5 for t in portrait["targets"]),("undersized Guide controls",portrait)
            page.locator('#clGuide [data-cl="guidehide"]').press("Enter")
            assert page.evaluate("document.activeElement?.dataset?.cl==='guideshow'"),"collapse lost keyboard focus"
            page.locator('#clGuide [data-cl="guideshow"]').press("Enter")
            assert page.evaluate("document.activeElement?.dataset?.cl==='guidehide'"),"reopen lost keyboard focus"
            # Orientation changes must return the Guide to the correct owned panel.
            page.set_viewport_size({"width":1180,"height":820})
            page.wait_for_function("document.querySelector('#app')?.classList.contains('tablet-land')")
            page.wait_for_function("document.querySelector('#clGuide')?.parentElement?.id==='dock'")
            landscape=measure(page)
            assert landscape["parent"]=="dock" and not landscape["sceneOverlap"],("landscape Guide overlap",landscape)
            assert landscape["overflow"]<=2,("landscape horizontal overflow",landscape)
            page.set_viewport_size({"width":820,"height":1180})
            page.wait_for_function("document.querySelector('#app')?.classList.contains('tablet-portrait')")
            page.wait_for_function("document.querySelector('#clGuide')?.parentElement?.id==='dock'")
            portrait_again=measure(page)
            assert not portrait_again["sceneOverlap"] and not portrait_again["resultOverlap"],("return portrait overlap",portrait_again)
            page.set_viewport_size({"width":390,"height":844})
            page.wait_for_function("document.querySelector('#app')?.classList.contains('narrow')")
            page.wait_for_function("document.querySelector('#clGuide')?.parentElement===document.body")
            phone=measure(page)
            assert phone["parent"]!="dock",("phone Guide remained in tablet panel",phone)
            assert phone["overflow"]<=2,("phone horizontal overflow",phone)
            assert not errors,errors
            print("PASS: tablet portrait/landscape Guide location, focus, targets and responsive return",flush=True)
        finally:
            context.close()
            browser.close()


if __name__=="__main__":
    check()
