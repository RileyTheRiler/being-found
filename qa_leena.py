"""Issue #17 — optional Leena story. Automated Chrome is not human validation."""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
ART=Path(os.environ.get("BF_TEST_ARTIFACTS","qa-artifacts"));ART.mkdir(parents=True,exist_ok=True)
def test(browser,w,h,reduced=False):
  mobile=w<700
  cx=browser.new_context(viewport={"width":w,"height":h},has_touch=mobile,is_mobile=mobile,reduced_motion="reduce" if reduced else "no-preference")
  p=cx.new_page();errors=[];p.on("pageerror",lambda e:errors.append(str(e)))
  try:
    p.goto(URL,wait_until="load")
    p.wait_for_function("typeof window.LW?.startFlat==='function' && !!window.BFLeena")
    p.evaluate("document.querySelector('#plSkip')?.click()")
    p.locator('#mTitle .bf-dest [data-go="flats"]').click()
    rooms=p.locator("#mFlats")
    rooms.locator("[data-bf-leena]").wait_for()
    original=p.evaluate("LW.S.flatIx")
    rooms.locator("[data-bf-leena]").click()
    d=p.locator("#bf-leena-dialog")
    assert d.evaluate("(el)=>el.open")
    assert d.get_attribute("aria-labelledby")=="leena-heading"
    assert p.evaluate("document.activeElement.closest('#bf-leena-dialog')!==null")
    assert d.locator(".leena-prop").count()==3
    box=d.bounding_box()
    assert box and box["x"]>=-1 and box["y"]>=-1 and box["x"]+box["width"]<=w+2 and box["y"]+box["height"]<=h+2,box
    rects=d.locator(".leena-prop").evaluate_all("""els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})""")
    for i,a in enumerate(rects):
      for b in rects[i+1:]:
        assert min(a["x"]+a["w"],b["x"]+b["w"])-max(a["x"],b["x"])<=0 or min(a["y"]+a["h"],b["y"]+b["h"])-max(a["y"],b["y"])<=0,(w,h,rects)
    p.add_script_tag(path="node_modules/axe-core/axe.min.js")
    violations=p.evaluate("""async()=>{const report=await axe.run(document.querySelector('#bf-leena-dialog'));return report.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>n.target)}));}""")
    assert not violations,violations
    for name in ["calendar","cart","phone"]:
      d.locator("[data-obj='"+name+"']").click()
      assert "Observed" in d.inner_text()
      d.locator('[data-choice="0"]').click()
      assert name in p.evaluate("BFLeena.state.seen")
      assert p.evaluate("document.documentElement.scrollWidth-innerWidth")<=2
    assert "3 / 3" in d.inner_text()
    d.get_by_role("button",name="Continue the conversation").click()
    assert "I live with bipolar disorder" in d.inner_text()
    d.get_by_role("button",name="Ask permission to hear about earlier periods").click()
    for key,date in [("expansive","April–May 2025"),("distant","October–November 2024")]:
      d.locator('[data-memory="'+key+'"]').click()
      assert date in d.locator("#leena-heading").inner_text()
      d.get_by_role("button",name="Back to Leena’s recollections").click()
    d.get_by_role("button",name="Return to the present conversation").click()
    d.get_by_role("button",name="Say what you do not know").click()
    assert p.evaluate("BFLeena.state.ending")=="uncertain"
    assert "Still unknown" in d.inner_text()
    assert p.evaluate("LW.S.flatIx")==original
    p.screenshot(path=str(ART/f"leena_{w}x{h}.png"))
    for _ in range(12):
      p.keyboard.press("Tab")
      assert p.evaluate("document.activeElement.closest('#bf-leena-dialog')!==null"),"Modal Tab escaped"
    d.get_by_role("button",name="Replay Leena’s story").click()
    assert p.evaluate("BFLeena.state.seen.length")==0
    d.get_by_role("button",name="Respect her space and leave").click()
    assert p.evaluate("BFLeena.state.ending")=="leave"
    d.get_by_role("button",name="Replay Leena’s story").click()
    for name in ["calendar","cart","phone"]:
      d.locator("[data-obj='"+name+"']").click();d.locator('[data-choice="1"]').click()
    d.get_by_role("button",name="Continue the conversation").click()
    d.get_by_role("button",name="Ask if she would rather stop talking").click()
    assert p.evaluate("BFLeena.state.ending")=="refusal"
    d.get_by_role("button",name="Return to Rooms",exact=True).click()
    assert not d.evaluate("(el)=>el.open")
    assert rooms.locator("[data-bf-leena]").evaluate("(el)=>document.activeElement===el")
    assert p.evaluate("LW.S.flatIx")==original
    if reduced: assert p.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    assert not errors,errors
    print(f"PASS Leena {w}x{h} reduced={reduced}",flush=True)
  finally:cx.close()
if __name__=="__main__":
  with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
    for w,h in [(390,844),(820,1180),(1180,820),(1440,900)]:test(b,w,h)
    test(b,390,844,True)
    b.close()
  print("ALL LEENA OPTIONAL STORY REGRESSIONS PASSED",flush=True)
