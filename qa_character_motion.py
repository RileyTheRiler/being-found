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
      state:BFRig.lastState,frame:BFRig.walkFrame,actualFrame:BFRig.lastFrameIndex,
      actualDirection:BFRig.lastDirection,face:BFRig.facing,
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
        for step in range(10):
            page.wait_for_timeout(130)
            frames.append(sample(page))
            if name=="desktop" and step in (1,3,5,7):
                page.screenshot(path=str(OUT/f"{name}-walking-step-{step}.png"))
        active=[x for x in frames if x["state"]=="walk" and x["moving"]]
        assert len(active)>=3,(name,"walk not active",frames)
        assert len({x["frame"] for x in active})>=3,(name,"missing walk frames",frames)
        assert len({x["actualFrame"] for x in active})>=3,(name,"rendered sprite stuck",frames)
        assert all(x["face"]==2 and x["actualDirection"]==2 for x in active),(name,"wrong right-facing pose",frames)
        assert active[-1]["traveled"]>active[0]["traveled"],(name,"not advancing with distance",frames)
        # Check actual painted RGBA pixels, not only the reported animation state.
        # Render the same authored model to an offscreen transparent canvas.
        # Two different walking frames must have visibly different silhouettes.
        page.evaluate("""() => {
          window.__bfWalkRaster=() => {
            const c=document.createElement('canvas');c.width=370;c.height=360;
            const g=c.getContext('2d',{willReadFrequently:true});
            g.translate(185,318);g.scale(2.90,2.90);
            const q=LW.S.sim;
            const o={char:LW.S.flat.char,bfMainActor:true,scale:LW.S.flat.char.scale||0,
              moving:!!q.path.length,pose:'stand',face:q.face,flip:q.flip,ph:q.ph};
            if(!BFRig.drawActor(g,0,0,o))throw Error('Model sprite was not drawn');
            return {pixels:g.getImageData(0,0,c.width,c.height).data,
              frame:BFRig.lastFrameIndex,dir:BFRig.lastDirection};
          };
          window.__bfWalkRasterA=__bfWalkRaster();
        }""")
        page.wait_for_timeout(250)
        painted=page.evaluate("""() => {
          const a=window.__bfWalkRasterA,b=window.__bfWalkRaster();
          let occupied=0,changed=0;
          for(let i=0;i<a.pixels.length;i+=4){
            if(a.pixels[i+3]>20||b.pixels[i+3]>20){
              occupied++;
              if(Math.abs(a.pixels[i]-b.pixels[i])+
                 Math.abs(a.pixels[i+1]-b.pixels[i+1])+
                 Math.abs(a.pixels[i+2]-b.pixels[i+2])+
                 Math.abs(a.pixels[i+3]-b.pixels[i+3])>80)changed++;
            }
          }
          return {occupied,changed,ratio:occupied?changed/occupied:0,
                  first:a.frame,last:b.frame,dir:b.dir};
        }""")
        assert painted["occupied"]>4000,(name,"sprite invisible",painted)
        assert painted["ratio"]>.025,(name,"walk frames not visually different",painted)
        page.screenshot(path=str(OUT/f"{name}-walk.png"))
        assert start_route(page,"phone","mirror"),"Leftward path could not start"
        page.wait_for_timeout(550)
        left=sample(page)
        assert left["state"]=="walk" and left["face"]==6 and left["actualDirection"]==6,(name,"wrong left-facing pose",left)
        # Use the real visible sofa action, not a synthetic pose assignment.
        # The earlier regression forced the state and missed the user's issue.
        page.evaluate("""() => {
          LW.closeModals();LW.startFlat(0);BFSkillChecks.setEnabled(false);
        }""")
        page.locator('#bf-room-nav [data-room="living"]').click(timeout=8000)
        page.locator('.pin[data-obj="sofa"]').click(timeout=8000)
        page.get_by_role("button",name="Sit down for a minute").click(timeout=8000)
        page.wait_for_function("LW.S.sim.pose==='sit'&&LW.S.sim.at==='sofa'",timeout=15000)
        page.wait_for_timeout(150)
        early=sample(page)
        assert 516<=early["position"][1]<=574,(name,"sofa movement outside scene",early)
        page.wait_for_function("""() => BFStageSync.seatMotion(LW.S)?.progress>=.98""",timeout=9000)
        seat=sample(page)
        assert seat["state"]=="sit",(name,"seated sprite not selected",seat)
        assert abs(seat["position"][0]-455)<.05 and abs(seat["position"][1]-516)<.05,(name,"seated anchor did not settle on cushion",seat)
        page.screenshot(path=str(OUT/f"{name}-sofa.png"))
        for idx in (1,2):
            start(page,idx)
            page.evaluate("""() => {
              const s=LW.S.sim;s.path=[];s.pose='sit';s.at='sofa';
              s.x=OBJECTS.sofa.stand[0];s.y=OBJECTS.sofa.stand[1];
              BFRoom.navigate('living');
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
        reduced=browser.new_context(viewport={"width":1440,"height":900},
          reduced_motion="reduce")
        p=reduced.new_page()
        p.goto(URL,wait_until="load")
        p.wait_for_function("!!window.BFRig && !!document.querySelector('[data-bf-walk-motion]')")
        assert p.evaluate("BFRig.reducedMotion===true"),"Reduced motion must be default"
        p.locator('[data-bf-walk-motion]').evaluate("(button)=>button.click()")
        assert p.evaluate("BFRig.reducedMotion===false && BFRig.forceWalking===true"),"Manual motion opt-in failed"
        reduced.close()
        browser.close()
    print("CHARACTER ANIMATION AND SOFA REGRESSION PASSED",flush=True)
