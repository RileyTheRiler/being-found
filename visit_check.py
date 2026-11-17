import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
OUT=Path(os.environ.get('BF_TEST_ARTIFACTS','qa-artifacts'))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
PIN="(()=>{const p=document.querySelector('#pins .pin.npc');if(!p)return null;const r=p.getBoundingClientRect(),s=document.querySelector('#scene').getBoundingClientRect();return {in:r.x>=s.x&&r.right<=s.right&&r.y>=s.y&&r.bottom<=s.bottom,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.pin')===p,who:LW.S.flat.name,sel:BFRoom.selected}})()"
ok=True
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
    for name,(w,h,touch) in {"phone":(390,844,True),"phoneL":(844,390,True),"tablet":(1024,1366,True),"desk":(1440,900,False)}.items():
        ctx=b.new_context(viewport={"width":w,"height":h},has_touch=touch,is_mobile=touch and min(w,h)<600); page=ctx.new_page(); js=page.evaluate
        errs=[]; page.on("pageerror",lambda e:errs.append(str(e)[:120]))
        page.goto(URL,wait_until="load"); page.wait_for_timeout(700); js("document.querySelector('#plSkip')?.click()"); page.wait_for_timeout(800)
        if not js("typeof startVisit==='function'"): print("startVisit is not global"); ok=False; break
        page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats [data-go="visitintro"]').click(); page.wait_for_timeout(900); page.get_by_role("button",name="Knock on Flat 1").click(); page.wait_for_timeout(2500)
        seen=[]
        for v in range(5):
            if v: js("startVisit(%d)"%v); page.wait_for_timeout(3500)
            m=js(PIN); seen.append(m)
            if m and m["hit"]:
                page.locator('#pins .pin.npc').click(timeout=5000); page.wait_for_timeout(900); m["menu"]=js("[...document.querySelectorAll('#bubbles button')].filter(x=>x.checkVisibility()).length"); js("document.querySelector('#bubbles button')?.click()"); page.wait_for_timeout(400)
            if name in("phone","desk"): page.screenshot(path=f"{OUT}/vis5_{name}_{v}.png")
        good=all(s and s["in"] and s["hit"] and s.get("menu",0)>=3 for s in seen) and not errs; ok&=good
        print("PASS" if good else "FAIL",name,[(s["who"],s["sel"],s["in"],s["hit"],s.get("menu")) if s else None for s in seen],errs)
        ctx.close()
    b.close()
print("ALL PASS" if ok else "SOME FAILED")

if not ok: raise SystemExit(1)
