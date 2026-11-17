import os
import shutil
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
OUT=Path(sys.argv[2] if len(sys.argv)>2 else os.environ.get('BF_TEST_ARTIFACTS','qa-artifacts'))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
VIS="(root=>[...document.querySelectorAll(root+' button, '+root+' summary')].filter(b=>{const r=b.getBoundingClientRect();return r.width>2&&r.height>2&&b.checkVisibility({contentVisibilityAuto:true,visibilityProperty:true})}).map(b=>(b.querySelector('b,strong,.fname')?.textContent||b.textContent).trim().replace(/\\s+/g,' ').slice(0,26)))"
ok=True
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
    for name,(w,h,touch) in {"phone":(390,844,True),"desk":(1440,900,False)}.items():
        ctx=b.new_context(viewport={"width":w,"height":h},device_scale_factor=2,has_touch=touch,is_mobile=touch); page=ctx.new_page(); js=page.evaluate
        errs=[]; page.on("pageerror",lambda e:errs.append(str(e)[:100]))
        def fresh():
            page.goto(URL,wait_until="load"); page.wait_for_timeout(700); js("document.querySelector('#plSkip')?.click()"); page.wait_for_timeout(800)
        fresh(); t=js(VIS+"('#mTitle')"); print(name,"title:",t); page.screenshot(path=f"{OUT}/mn_{name}_title.png")
        page.locator("#mTitle summary").click(); page.wait_for_timeout(300); about=js(VIS+"('#mTitle details')"); print(name,"about:",about); page.screenshot(path=f"{OUT}/mn_{name}_about.png")
        page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(700)
        r=js(VIS+"('#mFlats')"); heads=js("[...document.querySelectorAll('#mFlats .mcard>h2')].map(h=>h.textContent)"); print(name,"rooms:",len(r),heads); page.screenshot(path=f"{OUT}/mn_{name}_rooms.png",full_page=False)
        js("document.querySelector('#mFlats .mcard').scrollTop=9999;document.querySelector('#mFlats').scrollTop=9999"); page.wait_for_timeout(300); page.screenshot(path=f"{OUT}/mn_{name}_rooms2.png")
        res={}
        # each route still works
        page.locator('#mFlats [data-go="close"]').click(); page.wait_for_timeout(500); res["back to title"]=js("document.querySelector('#mTitle').classList.contains('on')")
        page.locator('#mTitle .bf-dest [data-go="sandbox"]').click(); page.wait_for_timeout(2200); res["sandbox"]=js("LW.S.mode==='sandbox'&&!document.querySelector('.modal.on')")
        fresh(); page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats [data-dele]').click(); page.wait_for_timeout(1500); res["Dele encounter"]=js("!!document.querySelector('.dl-primary, .dl-move')")
        fresh(); page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats [data-enc]').click(); page.wait_for_timeout(1500); res["Walt encounter"]=js("!!document.querySelector('[data-encgo]')")
        fresh(); page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats [data-go="visitintro"]').click(); page.wait_for_timeout(1200); res["epilogue intro"]=js("!!document.querySelector('.modal.on')&&!document.querySelector('#mFlats.on')")
        fresh(); page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats [data-go="final"]').click(); page.wait_for_timeout(1200); res["compare"]=js("!!document.querySelector('.modal.on')&&!document.querySelector('#mFlats.on')")
        fresh(); page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats .flatcard[data-ix="6"]').click(); page.wait_for_timeout(700); page.locator('[data-go="flat"]').first.click(); page.wait_for_timeout(2500); res["client room (Walt)"]=js("LW.S.flat.name")
        # saved game: Continue stays on the title
        fresh(); page.get_by_role("button",name="Start the guided story").click(); page.get_by_role("button",name="Enter Noor’s room").click(); page.wait_for_timeout(2000); fresh()
        res["title after a save"]=js(VIS+"('#mTitle')")
        good=all(v for v in res.values()) and not errs and len(t)<=6; ok&=good
        print("PASS" if good else "FAIL",name,res,errs)
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED")

if not ok: raise SystemExit(1)
