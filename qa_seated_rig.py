"""Seat rig regression using the real sofa button, model pixels and geometry.

Screenshots at each transition stage are artifacts for subsequent human review;
the geometric assertions alone do not establish natural-looking movement.
"""
import os
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
ART = Path(os.environ.get("BF_TEST_ARTIFACTS", "qa-artifacts"))
ART.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")


def boot(page):
    # Avoid the first-visit cinematic obscuring cross-resident visual evidence.
    target=URL+("&" if "?" in URL else "?")+"noopening"
    page.goto(target, wait_until="load")
    page.wait_for_function("typeof window.LW?.startFlat==='function'")
    page.evaluate("() => window.LWPrologue?.finish?.()")
    page.evaluate("() => {LW.closeModals();LW.startFlat(0);BFSkillChecks.setEnabled(false);}")
    page.wait_for_function("BFRig.loaded===true", timeout=20000)


def sample(page):
    return page.evaluate("""() => ({
      geometry:BFRig.lastSeatGeometry,
      nav:BFNavigation.position(LW.S),
      seat:BFStageSync.seatMotion(LW.S),
      pose:LW.S.sim.pose,
      walk:LW.S.sim.path.length>0,
      source:BFRig.lastFrameIndex,
      mode:BFRig.lastState,
      errors:document.documentElement.scrollWidth-innerWidth
    })""")


def at_progress(page, u):
    page.evaluate("""async u => {
       const s=LW.S.sim;
       if(!s.act)throw Error('No authored sofa action');
       s.prog=s.dur*u;
       await new Promise(resolve=>requestAnimationFrame(resolve));
    }""", u)
    return sample(page)


def test(browser, name, w, h, touch):
    ctx = browser.new_context(viewport={"width":w, "height":h},
                              is_mobile=touch, has_touch=touch,
                              reduced_motion="no-preference")
    page=ctx.new_page()
    failures=[]
    page.on("pageerror", lambda e: failures.append(str(e)))
    try:
        boot(page)
        page.locator('#bf-room-nav [data-room="living"]').click()
        page.locator('.pin[data-obj="sofa"]').click()
        page.get_by_role("button", name="Sit down for a minute", exact=True).click()
        page.wait_for_function("LW.S.sim.at==='sofa'&&!!LW.S.sim.act", timeout=22000)
        record=[]
        for u,label in ((.08,"start"),(.31,"fold"),(.46,"lower"),(.61,"near-seat"),(.77,"seated")):
            v=at_progress(page,u)
            g=v["geometry"]
            assert g and g["character"]=="noor",(name,label,"missing seat rig",v)
            assert g["sourceColumn"]==0 and v["source"]==0,(name,label,"wrong raster source",v)
            assert len(g["knees"])==len(g["feet"])==2,(name,label,"missing joint",g)
            assert all(-5.7<=foot[1]<=-2.99 for foot in g["feet"]),(name,label,"foot lift excessive",g)
            if label in ("start","seated"):
                assert all(abs(foot[1]+3)<.001 for foot in g["feet"]),(name,label,"shoe not planted",g)
            # Floor-restoration cancels the legacy vertical cushion pivot.
            floor=v["nav"][1]+g["floorCorrection"]
            assert abs(floor-574)<1,(name,label,"shoe baseline lifted",v)
            assert v["errors"]<=2,(name,label,"horizontal overflow",v)
            record.append(g)
            page.screenshot(path=str(ART/f"{name}-articulated-seat-{label}.png"))
        assert record[-1]["amount"]>record[1]["amount"]>record[0]["amount"],(name,"seat stage stalled",record)
        assert record[-1]["hip"][0]>record[0]["hip"][0]+8,(name,"hip did not lower",record)
        first=abs(record[0]["knees"][0][0]-record[0]["feet"][0][0])
        last=abs(record[-1]["knees"][0][0]-record[-1]["feet"][0][0])
        assert last<first-3,(name,"calf still slopes backwards",first,last)
        assert abs(record[-1]["feet"][0][0]-record[0]["feet"][0][0])>18,(name,"foot did not reposition",record)
        assert record[-1]["footStep"]==1 and record[-1]["footLift"]<.001,(name,"shoe did not plant",record[-1])
        page.wait_for_function("!LW.S.sim.act",timeout=8000)
        page.screenshot(path=str(ART/f"{name}-articulated-seat-settled.png"))
        # A real second selection must first trigger rising, not teleporting.
        page.locator('#bf-room-nav [data-room="kitchen"]').click()
        page.locator('.pin[data-obj="stove"]').click()
        page.get_by_role("button",name="Fry an egg",exact=True).click()
        page.wait_for_function("!!BFNavigation.seatExit",timeout=9000)
        rising=[]
        for i in range(5):
            page.wait_for_timeout(95)
            v=sample(page)
            rising.append(v)
            if i in (1,3):
                page.screenshot(path=str(ART/f"{name}-articulated-rise-{i}.png"))
        amounts=[v["geometry"]["amount"] for v in rising if v["geometry"]]
        assert len(amounts)>=3 and amounts[-1]<amounts[0],(name,"reverse knee motion missing",amounts)
        assert all(v["walk"] for v in rising),(name,"lost pending route while rising",rising)
        assert not failures,(name,"JavaScript errors",failures)
        print(name,"PASS: seated model hips/knees, planted shoes, actual click and rise",flush=True)
    finally:
        ctx.close()


def test_other_characters(browser):
    ctx=browser.new_context(viewport={"width":1440,"height":900},reduced_motion="no-preference")
    p=ctx.new_page()
    try:
        boot(p)
        for ix,character in ((1,"tomas"),(2,"dele")):
            p.evaluate("""(ix) => {
               LW.closeModals();LW.startFlat(ix);
               const s=LW.S.sim;s.path=[];s.pose='sit';s.at='sofa';
               BFRoom.navigate('living');
            }""",ix)
            p.evaluate("() => window.LWPrologue?.finish?.()")
            p.wait_for_function("BFRig.loaded",timeout=20000)
            # Atlas loading is asynchronous across flats. Wait for the new
            # character's rendered frame, not stale geometry from the old flat.
            p.wait_for_function(
                "(character) => BFRig.lastSeatGeometry?.amount===1 && BFRig.lastSeatGeometry?.character===character",
                arg=character,timeout=15000)
            v=sample(p)
            assert v["geometry"]["character"]==character,(character,v)
            p.screenshot(path=str(ART/f"desktop-{character}-articulated-seat.png"))
    finally:
        ctx.close()


def test_reduced_motion(browser):
    ctx=browser.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce")
    p=ctx.new_page()
    try:
        boot(p)
        p.locator('#bf-room-nav [data-room="living"]').click()
        p.locator('.pin[data-obj="sofa"]').click()
        p.get_by_role("button",name="Sit down for a minute",exact=True).click()
        p.wait_for_function("LW.S.sim.at==='sofa'&&!!LW.S.sim.act",timeout=22000)
        v=at_progress(p,.55)
        assert v["geometry"] and v["geometry"]["lean"]==0,(v,"reduced motion should remove torso swing")
    finally:
        ctx.close()


if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        test(browser,"desktop",1440,900,False)
        test(browser,"phone",390,844,True)
        test(browser,"tablet-portrait",820,1180,True)
        test_other_characters(browser)
        test_reduced_motion(browser)
        browser.close()
    print("ARTICULATED SOFA QA PASSED")
