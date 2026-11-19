"""Phone interaction choreography regression: real action, real drawn frames.

This test checks Noor's phone call on desktop and mobile. It verifies that
the authored call remains an action, not an automatic scene/goal mutation, and
that the handset and character follow reach -> lift -> use -> lower -> release.
It does not assert a video-level quality judgment from UI state alone.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
OUT=Path(os.environ.get("BF_TEST_ARTIFACTS","qa-artifacts"))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")

STAGES=[
    (.12,"reach",True,{7,8,9,10}),
    (.25,"lift",False,{10,12}),
    (.50,"use",False,{12}),
    (.785,"lower",False,{10,12}),
    (.89,"release",False,{7,8,9,10}),
    (.963,"rest",True,{0}),
]

def prepare(page):
    page.goto(URL,wait_until="load")
    page.wait_for_function("!!window.LW && !!window.BFStageSync?.phoneMotion && !!window.BFRig?.drawActor")
    page.evaluate("document.querySelector('#plSkip')?.click()")
    page.evaluate("""() => {
      LW.closeModals();LW.startFlat(0);
      BFSkillChecks.setEnabled(false);
    }""")
    page.wait_for_function("window.BFRig?.loaded===true",timeout=15000)
    page.locator('#bf-room-nav [data-room="sleeping"]').click(timeout=10000)
    page.locator('.pin[data-obj="phone"]').click(timeout=10000)
    call=page.locator('#bubbles button.bub').filter(has_text="Call").first
    call.wait_for(state="visible",timeout=10000)
    call.click(timeout=10000)
    page.wait_for_function("""() => LW.S.sim.at==='phone' &&
      !!LW.S.sim.act && BFStageSync.phoneMotion(LW.S)?.action==='call'""",timeout=25000)

def sample(page,u):
    return page.evaluate("""async (u) => {
      const s=LW.S.sim;
      s.prog=s.dur*u;
      await new Promise(resolve=>requestAnimationFrame(resolve));
      const p=BFStageSync.phoneMotion(LW.S);
      if(!p)throw Error('Phone motion disappeared during action');
      const cv=document.querySelector('#cv');
      const cx=cv.getContext('2d',{willReadFrequently:true});
      const [x,y]=BFNavigation.position(LW.S);
      // Sample pixels near the modeled actor, not a label or abstract action flag.
      const left=Math.max(0,Math.floor((VIEW.ox+(x-85)*VIEW.s)*VIEW.dpr));
      const top=Math.max(0,Math.floor((VIEW.oy+(y-185)*VIEW.s)*VIEW.dpr));
      const width=Math.max(1,Math.min(cv.width-left,Math.ceil(170*VIEW.s*VIEW.dpr)));
      const height=Math.max(1,Math.min(cv.height-top,Math.ceil(190*VIEW.s*VIEW.dpr)));
      const pixels=cx.getImageData(left,top,width,height).data;
      let hash=2166136261,opaque=0;
      for(let i=0;i<pixels.length;i+=16) {
        hash=Math.imul(hash ^ pixels[i],16777619)>>>0;
        if(pixels[i+3]>30)opaque++;
      }
      return {
        motion:p,drawnFrame:BFRig.lastFrameIndex,drawState:BFRig.lastState,
        drawnCount:BFRig.totalDraws,phoneOnTable:p.table,hold:BFStageSync.phoneHeld(LW.S),
        dur:s.dur,action:!!s.act,hash,opaque,
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    }""",u)

def run_case(browser,name,width,height,touch):
    context=browser.new_context(viewport={"width":width,"height":height},
      has_touch=touch,is_mobile=touch,reduced_motion="no-preference")
    page=context.new_page()
    errors=[]
    page.on("pageerror",lambda e: errors.append(str(e)))
    try:
        prepare(page)
        duration=page.evaluate("LW.S.sim.dur")
        assert duration>=4.05,(name,"call animation ends too soon",duration)
        states=[]
        for u,stage,table,frames in STAGES:
            info=sample(page,u)
            pose=info["motion"]
            assert pose["stage"]==stage,(name,u,pose)
            assert pose["table"]==table,(name,u,"table ownership",pose)
            assert info["drawnFrame"] in frames,(name,u,"wrong actual sprite",info)
            assert info["action"],(name,u,"action ended during animation",info)
            assert info["overflow"]<=2,(name,u,"page overflow",info)
            assert info["opaque"]>200,(name,u,"missing visible actor",info)
            states.append(info)
            if name=="desktop" or u in (.5,.89):
                page.screenshot(path=str(OUT/f"{name}-phone-{stage}.png"))
        assert len({s["hash"] for s in states})>=4,(name,"painted frames show no change")
        assert states[2]["drawnFrame"]==12,(name,"phone not held in pose",states[2])
        assert states[-1]["phoneOnTable"],(name,"phone never returned to table")
        # Let the authored action complete normally: do not call finishAction.
        page.wait_for_function("!LW.S.sim.act",timeout=6000)
        result=page.evaluate("""() => ({
            card:LW.S.card?.title||'',
            at:LW.S.sim.at,
            phone:BFStageSync.phoneMotion(LW.S),
            onTable:!BFStageSync.phoneHeld(LW.S)
        })""")
        assert result["at"]=="phone" and result["phone"] is None,(name,result)
        assert result["onTable"] and result["card"],(name,"action completion",result)
        assert not errors,(name,errors)
        print(name,"PASS",duration,[s["motion"]["stage"] for s in states],flush=True)
    finally:
        context.close()

if __name__=="__main__":
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
        run_case(browser,"desktop",1440,900,False)
        run_case(browser,"phone",390,844,True)
        browser.close()
    print("PHONE CHOREOGRAPHY AND OUTCOME REGRESSION PASSED")
