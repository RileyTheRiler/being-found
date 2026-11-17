"""Cross-flat stove and Dele's mobile narrative hint regression.

Checks the existing authored menu in each flat; this does not assert that
identical actions are available to different residents.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
OUT=Path(os.environ.get("BF_TEST_ARTIFACTS","qa-artifacts"))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
SIZES=[("phone-small",360,640,True),("phone",390,844,True),("desktop",1440,900,False)]

def info(page):
    return page.evaluate("""() => {
      const room=document.querySelector('#bf-room-nav');
      const controls=[...document.querySelectorAll('#bubbles button.bub')]
        .filter(b=>b.checkVisibility({visibilityProperty:true}));
      const nav=room?.querySelector('[data-room="kitchen"]');
      return {
        who:LW?.S?.flat?.name,
        active:BFRoom?.selected,
        kitchenSelected:nav?.classList.contains('active') ||
          nav?.getAttribute('aria-pressed')==='true',
        count:controls.length,
        actions:controls.map(b=>b.textContent.trim().slice(0,45)),
        overflow:document.documentElement.scrollWidth-innerWidth
      };
    }""")

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
    for name,width,height,touch in SIZES:
        ctx=browser.new_context(viewport={"width":width,"height":height},
            has_touch=touch,is_mobile=touch and min(width,height)<600,
            reduced_motion="reduce")
        page=ctx.new_page()
        errors=[]
        page.on("pageerror",lambda err: errors.append(str(err)))
        page.goto(URL,wait_until="load")
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.wait_for_timeout(300)
        flats=[]
        for ix in range(5):
            page.evaluate("(ix) => { LW.closeModals(); LW.startFlat(ix); }",ix)
            page.wait_for_timeout(200)
            page.locator('#bf-room-nav [data-room="kitchen"]').click(timeout=8000)
            page.wait_for_timeout(400)
            page.locator('.pin[data-obj="stove"]').click(timeout=8000)
            page.wait_for_function("""() => [...document.querySelectorAll('#bubbles button.bub')]
              .some(b=>b.checkVisibility({visibilityProperty:true}))""",timeout=9000)
            state=info(page)
            flats.append(state)
            assert state["active"]=="kitchen",(name,ix,state)
            assert state["count"]>=1,(name,ix,state)
            assert state["overflow"]<=2,(name,ix,state)
            assert not errors,(name,ix,errors)
        # Dele's initial hint must remain readable and its action usable on phones.
        if touch:
            page.evaluate("() => { LW.closeModals(); LW.startFlat(2); }")
            hint=page.locator("#result .story-thread .story-next")
            hint.wait_for(state="visible",timeout=8000)
            hint.scroll_into_view_if_needed()
            geom=page.evaluate("""() => {
              const row=document.querySelector('#result .story-next');
              const text=row?.querySelector('span');
              const btn=row?.querySelector('button[data-story-target]');
              if(!text||!btn)return null;
              const r=text.getBoundingClientRect(),b=btn.getBoundingClientRect();
              return {
                label:text.textContent.trim(),
                textWidth:text.scrollWidth,
                availableWidth:text.clientWidth,
                buttonHeight:b.height,
                buttonVisible:b.width>0&&b.height>0,
                buttonHit:document.elementFromPoint(b.left+b.width/2,b.top+b.height/2)?.closest('button')===btn,
                overflow:document.documentElement.scrollWidth-innerWidth
              };
            }""")
            assert geom and geom["label"],(name,geom)
            assert geom["textWidth"]<=geom["availableWidth"]+2,(name,geom)
            assert geom["buttonHeight"]>=44 and geom["buttonHit"],(name,geom)
            assert geom["overflow"]<=2,(name,geom)
            page.locator("#result [data-story-target]").click(timeout=8000)
            page.wait_for_function("""() => [...document.querySelectorAll('#bubbles button.bub')]
              .some(b=>b.checkVisibility({visibilityProperty:true}))""",timeout=9000)
            page.screenshot(path=str(OUT/f"{name}-dele-hint.png"))
        assert not errors,(name,errors)
        print(name,"PASS:",[(x["who"],x["count"]) for x in flats],flush=True)
        ctx.close()
    browser.close()
