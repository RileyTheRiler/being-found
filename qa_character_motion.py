"""Rendered walking and sofa-depth regression.

Exercises the visible sprite pipeline; no authored outcomes, dice or clinical
state values are changed. Screenshots are review artifacts, not visual proof.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
OUT=Path(os.environ.get("BF_TEST_ARTIFACTS","qa-artifacts"))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

def start(page,idx):
    page.evaluate("""(ix) => { LW.closeModals(); LW.startFlat(ix); }""",idx)
    page.wait_for_function("window.BFRoom?.drawn>3",timeout=10000)

def start_route(page,source,dest):
    return page.evaluate("""({source,dest}) => {
      const s=LW.S.sim;
      BFNavigation.cancel(LW.S);
      s.at=source;s.pose='stand';s.path=[];s.act=null;
      BFNavigation.reset(LW.S);
      return BFNavigation.goTo(LW.S,OBJECTS[dest].stand,()=>{
        s.at=dest;s.pose='stand';
      },OBJECTS);
    }""",{"source":source,"dest":dest})

def sample(page):
    return page.evaluate("""() => ({
      state:BFRig.lastState,frame:BFRig.walkFrame,face:BFRig.facing,
      traveled:BFRig.walkDistance,position:BFNavigation.position(LW.S),
      moving:LW.S.sim.path.length>0,errors:document.documentElement.scrollWidth-innerWidth
    })""")

def test(browser,name,width,height,touch):
    context=browser.new_context(viewport={"width":width,"height":height},
      has_touch=touch,is_mobile=touch,reduced_motion="no-preference")
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    try:
        page.goto(URL,wait_until="load")
        page.wait_for_function("typeof window.LW?.startFlat==='function'")
        page.evaluate("document.querySelector('#plSkip')?.click()")
        start(page,0)
        page.wait_for_function("window.BFRig?.loaded===true",timeout=15000)
        assert start_route(page,"mirror","phone"),"Rightward path could not start"
        frames=[]
        for _ in range(10):
            page.wait_for_timeout(130)
            frames.append(sample(page))
        active=[x for x in frames if x["state"]=="walk" and x["moving"]]
        assert len(active)>=3,(name,"walk not active",frames)
        assert len({x["frame"] for x in active})>=3,(name,"missing walk frames",frames)
        assert all(x["face"]==2 for x in active),(name,"wrong right-facing pose",frames)
        assert active[-1]["traveled"]>active[0]["traveled"],(name,"not advancing with distance",frames)
        page.screenshot(path=str(OUT/f"{name}-walk.png"))
        assert start_route(page,"phone","mirror"),"Leftward path could not start"
        page.wait_for_timeout(550)
        left=sample(page)
        assert left["state"]=="walk" and left["face"]==6,(name,"wrong left-facing pose",left)
        # A sitter remains in the authored seated pose and on the fixed cushion.
        page.evaluate("""() => {
          BFNavigation.cancel(LW.S);
          const s=LW.S.sim;s.path=[];s.at='sofa';s.pose='sit';
          BFNavigation.reset(LW.S);
        }""")
        page.wait_for_timeout(220)
        seat=sample(page)
        assert seat["state"]=="sit",(name,"seated sprite not selected",seat)
        assert seat["position"]==[455,561],(name,"seated feet not anchored",seat)
        page.screenshot(path=str(OUT/f"{name}-sofa.png"))
        for idx in (1,2):
            start(page,idx)
            page.evaluate("""() => {
              const s=LW.S.sim;s.path=[];s.pose='sit';s.at='sofa';
            }""")
            page.wait_for_function("window.BFRig?.loaded===true",timeout=15000)
            page.wait_for_timeout(180)
            assert page.evaluate("BFRig.lastState")== "sit",(name,idx,"sit state")
            page.screenshot(path=str(OUT/f"{name}-resident-{idx}-seated.png"))
        assert not errors,(name,errors)
        assert sample(page)["errors"]<=2,(name,"overflow")
        print(name,"PASS: right/left walking, advancing frames, sofa pose and other modeled residents",flush=True)
    finally:
        context.close()

if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        test(browser,"desktop",1440,900,False)
        test(browser,"phone",390,844,True)
        browser.close()
    print("CHARACTER ANIMATION AND SOFA REGRESSION PASSED",flush=True)
