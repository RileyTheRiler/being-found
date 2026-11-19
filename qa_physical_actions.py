"""Real-user staged sit/rise, cooking and painting regression.

Intentionally samples *rendered* action stages and genuine menu interactions.
This is not a human judgment of animation quality or a clinical simulation.
"""
import os, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
OUT=Path(os.environ.get("BF_TEST_ARTIFACTS","qa-artifacts"))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

def boot(page):
    page.goto(URL,wait_until="load")
    page.wait_for_function("typeof window.LW?.startFlat==='function'")
    page.evaluate("document.querySelector('#plSkip')?.click()")
    page.evaluate("() => { LW.closeModals();LW.startFlat(0);BFSkillChecks.setEnabled(false); }")
    page.wait_for_function("BFRig.loaded===true",timeout=20000)

def action(page,room,obj,name):
    page.locator(f'#bf-room-nav [data-room="{room}"]').click(timeout=12000)
    page.locator(f'.pin[data-obj="{obj}"]').click(timeout=12000)
    page.get_by_role("button",name=name,exact=True).click(timeout=12000)

def snapshot(page):
    return page.evaluate("""() => {
      const S=LW.S,m=BFStageSync;
      return {seat:m.seatMotion(S),work:m.workMotion(S),
        point:BFNavigation.position(S),exit:BFNavigation.seatExit,
        pose:S.sim.pose,at:S.sim.at,acting:!!S.sim.act,walking:S.sim.path.length>0,
        duration:S.sim.dur,frame:BFRig.lastFrameIndex,drawn:BFRig.totalDraws,
        painted:S.fx.painted,card:S.card?.title||null,
        overflow:document.documentElement.scrollWidth-innerWidth};
    }""")

def set_u(page,u):
    page.evaluate("""async u => {
      const s=LW.S.sim;if(!s.act)throw Error('No active authored action');
      s.prog=s.dur*u;
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }""",u)
    return snapshot(page)

def test(browser,name,w,h,touch):
    ctx=browser.new_context(viewport={"width":w,"height":h},
      has_touch=touch,is_mobile=touch,reduced_motion="no-preference")
    page=ctx.new_page();errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    try:
        boot(page)
        action(page,"living","sofa","Sit down for a minute")
        page.wait_for_function("LW.S.sim.at==='sofa'&&!!LW.S.sim.act",timeout=22000)
        anchors=[];frames=[]
        for u,stage in ((.08,"turn"),(.29,"lower"),(.40,"lower"),(.72,"settle")):
            v=set_u(page,u)
            assert v["seat"] and v["seat"]["kind"]=="sit",(name,u,v)
            assert v["seat"]["stage"]==stage,(name,u,v)
            assert 516<=v["point"][1]<=574,(name,"outside seat bounds",v)
            anchors.append(v["point"][1]);frames.append(v["frame"])
            page.screenshot(path=str(OUT/f"{name}-sit-{stage}-{int(u*100)}.png"))
        assert anchors==sorted(anchors,reverse=True),(name,"seat snapped or moved backwards",anchors)
        assert anchors[0]-anchors[1]<6,(name,"standing feet lifted before bend",anchors)
        assert anchors[0]-anchors[-1]>40,(name,"no visible vertical descent",anchors)
        assert frames[1]!=11 and frames[2]==11,(name,"seated pose not synchronized to descent",frames)
        assert 11 in frames,(name,"seated atlas never appeared",frames)
        page.wait_for_function("!LW.S.sim.act",timeout=7000)
        end=snapshot(page)
        assert end["pose"]=="sit" and abs(end["point"][1]-516)<1,(name,end)
        # The next user action triggers an actual rise before walking. Captures
        # are taken while the authored navigation sentinel is still active.
        action(page,"kitchen","stove","Fry an egg")
        page.wait_for_function("!!BFNavigation.seatExit",timeout=9000)
        lift=[];moving=[]
        for i in range(8):
            page.wait_for_timeout(90)
            v=snapshot(page);lift.append(v["point"][1]);moving.append(v["walking"])
            if i in (1,4,7):
                page.screenshot(path=str(OUT/f"{name}-rise-{i}.png"))
        assert lift[-1]>lift[0]+25,(name,"no rise from sofa",lift)
        assert all(moving),(name,"route sentinel lost during stand-up",moving)
        page.wait_for_function("LW.S.sim.at==='stove'&&!!LW.S.sim.act",timeout=23000)
        stove_duration=page.evaluate("LW.S.sim.dur")
        assert stove_duration>=3.5,(name,"stove action too fast",stove_duration)
        stove=[]
        for u,stage in ((.08,"prepare"),(.23,"reach"),(.48,"work"),(.68,"work"),(.91,"return")):
            v=set_u(page,u)
            assert v["work"] and v["work"]["obj"]=="stove",(name,u,v)
            assert v["work"]["stage"]==stage,(name,u,stage,v)
            stove.append(v["frame"])
            page.screenshot(path=str(OUT/f"{name}-cook-{stage}-{int(u*100)}.png"))
        assert len(set(stove))>=3,(name,"stove gesture is static",stove)
        page.wait_for_function("!LW.S.sim.act",timeout=6500)
        before=snapshot(page)["painted"]
        action(page,"sleeping","easel","Paint for a while")
        page.wait_for_function("LW.S.sim.at==='easel'&&!!LW.S.sim.act",timeout=23000)
        paint_duration=page.evaluate("LW.S.sim.dur")
        assert paint_duration>=3.65,(name,"paint action too fast",paint_duration)
        paint=[]
        for u,stage in ((.08,"prepare"),(.23,"lift"),(.44,"stroke"),(.68,"stroke"),(.9,"return")):
            v=set_u(page,u)
            assert v["work"] and v["work"]["obj"]=="easel",(name,u,v)
            assert v["work"]["stage"]==stage,(name,u,stage,v)
            paint.append(v["frame"])
            page.screenshot(path=str(OUT/f"{name}-paint-{stage}-{int(u*100)}.png"))
        assert len(set(paint))>=3,(name,"brush gesture is static",paint)
        page.wait_for_function("!LW.S.sim.act",timeout=6500)
        completed=snapshot(page)
        assert completed["painted"]>=before,(name,"lost prior progress",completed)
        assert completed["work"] is None and completed["seat"] is None,(name,"gesture persisted after completion",completed)
        assert completed["card"] and not errors,(name,"missing outcome or JavaScript errors",completed,errors)
        assert completed["overflow"]<=2,(name,"page overflow",completed)
        print(f"{name} PASS sit={anchors} rise={lift} stove={stove} paint={paint}",flush=True)
    finally:
        ctx.close()

if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        test(browser,"desktop",1440,900,False)
        test(browser,"phone",390,844,True)
        browser.close()
    print("STAGED SOFA AND WORK ACTION REGRESSION PASSED",flush=True)
