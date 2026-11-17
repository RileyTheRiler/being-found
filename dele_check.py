import sys
from playwright.sync_api import sync_playwright
URL="http://127.0.0.1:8770/index.html"; OUT="/home/claude/work/v837"
VIS="(()=>[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>2&&r.height>2&&b.checkVisibility({visibilityProperty:true})&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===b}).map(b=>b.textContent.trim().replace(/\\s+/g,' ').slice(0,34)))()"
SIZES={"phone":(390,844,True),"desk":(1440,900,False)}
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for name,(w,h,touch) in SIZES.items():
        ctx=b.new_context(viewport={"width":w,"height":h},device_scale_factor=2,has_touch=touch,is_mobile=touch); page=ctx.new_page(); js=page.evaluate
        errs=[]; page.on("pageerror",lambda e:errs.append(str(e)[:120]))
        page.goto(URL,wait_until="load"); page.wait_for_timeout(700); js("document.querySelector('#plSkip')?.click()"); page.wait_for_timeout(800)
        page.locator('#mTitle .bf-dest [data-go="flats"]').click(); page.wait_for_timeout(500); page.locator('#mFlats [data-dele]').click(); page.wait_for_timeout(1200)
        page.locator('.dl-primary').first.click(); page.wait_for_timeout(1500)
        page.screenshot(path=f"{OUT}/dl_{name}_door.png")
        for i in range(8):
            if js("[...document.querySelectorAll('.dl-move')].some(b=>/Leave and review/.test(b.textContent))"): break
            page.locator('.dl-move').first.click(); page.wait_for_timeout(1800)
        page.locator('.dl-move',has_text="Leave and review").click(); page.wait_for_timeout(1500)
        page.screenshot(path=f"{OUT}/dl_{name}_review.png")
        page.get_by_role("button",name="Look at the authored room").click(); page.wait_for_timeout(1500)
        for i in range(6):
            st=js("({flat:LW.S.flat&&LW.S.flat.name,modal:[...document.querySelectorAll('.modal.on')].map(m=>m.id)})"); bs=js(VIS)
            print(name,i,st,bs[:7]); page.screenshot(path=f'{OUT}/dl_{name}_s{i}.png')
            if st["flat"]=="Dele" and not st["modal"] and not js("!!document.querySelector('.dl-primary,.dl-move')?.checkVisibility()"): break
            t=js("""(()=>{const pick=[...document.querySelectorAll('button')].filter(b=>/Explore the authored day|^Enter|Begin|Start/.test(b.textContent.trim())||/dl-primary/.test(b.className)).find(b=>b.checkVisibility({visibilityProperty:true}));if(pick){pick.click();return pick.textContent.trim().slice(0,40)}return null})()"""); print("   ->",t); page.wait_for_timeout(2500)
            if not t: break
        page.screenshot(path=f"{OUT}/dl_{name}_room.png") if False else None; page.wait_for_timeout(1500); page.screenshot(path=f"{OUT}/dl_{name}_flat.png"); print(name,"errors",errs)
        ctx.close()
    b.close()
