"""Issue #17 — optional Leena story. Automated Chrome is not human validation."""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.environ.get("BF_TEST_URL","http://127.0.0.1:8770/index.html")
CHROME=os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
ART=Path(os.environ.get("BF_TEST_ARTIFACTS","qa-artifacts"));ART.mkdir(parents=True,exist_ok=True)
def assert_panel_heading_visible(d):
  """After every narrative transition, the new heading must be in view below sticky chrome."""
  state=d.evaluate("""el=>{
    const heading=el.querySelector('#leena-heading').getBoundingClientRect();
    const chrome=el.querySelector('.leena-top').getBoundingClientRect();
    const dialog=el.getBoundingClientRect();
    return {headingTop:heading.top,chromeBottom:chrome.bottom,dialogBottom:dialog.bottom,scrollTop:el.scrollTop};
  }""")
  assert state["scrollTop"]<2 and state["headingTop"]>=state["chromeBottom"]-2 and state["headingTop"]<state["dialogBottom"]-36,state
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
    assert d.locator(".leena-index-action").count()==3
    assert d.locator(".leena-scene-outline").count()==3
    # A focusable list control previews the same physical artwork as its hotspot.
    for name in ["calendar","cart","phone"]:
      d.locator('[data-thing="'+name+'"]').focus()
      actual=d.locator(".leena-scene").get_attribute("data-preview")
      assert actual==name,(w,h,name,actual)
      # Pointer hover must not overrule a focused nonspatial control.
      other="cart" if name=="calendar" else "calendar"
      d.locator('[data-obj="'+other+'"]').dispatch_event("mouseover")
      assert d.locator(".leena-scene").get_attribute("data-preview")==name,(w,h,name,other)
      # Labels should sit beside the object artwork rather than hide the object.
      overlap=d.evaluate("""(dialog,name)=>{
        const a=document.querySelector('.leena-prop.leena-'+name).getBoundingClientRect();
        const b=document.querySelector('.leena-outline-'+name).getBoundingClientRect();
        const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
        const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
        return x*y;
      }""",name)
      assert overlap<1,(w,h,name,overlap)
    d.locator("#leena-heading").focus()
    assert d.locator(".leena-scene").get_attribute("data-preview")==""
    if reduced:
      assert d.locator(".leena-outline-calendar").evaluate("(el)=>getComputedStyle(el).transitionDuration")=="0s"
    # Both illustrations are real generated SVG assets; no desktop crop on phones.
    p.wait_for_function("""() => {
      const im=document.querySelector('#bf-leena-dialog .leena-scene-picture img');
      return !!im && im.complete && im.naturalWidth>0 && im.naturalHeight>0;
    }""")
    image_source=d.locator(".leena-scene-picture img").evaluate("(im)=>im.currentSrc")
    assert image_source.endswith("leena_library_mobile.svg" if w<=600 else "leena_library_wide.svg"),image_source
    assert_panel_heading_visible(d)  # Initial transition, before screenshot scrolls into view.
    d.locator(".leena-scene").screenshot(path=str(ART/f"leena_scene_{w}x{h}.png"))
    d.evaluate("(el)=>{el.scrollTop=0}")  # Screenshot capture scrolls tall phone dialogs.
    assert_panel_heading_visible(d)
    assert "bipolar disorder" not in d.inner_text().lower(),"Unexpected pre-consent clinical disclosure"
    box=d.bounding_box()
    assert box and box["x"]>=-1 and box["y"]>=-1 and box["x"]+box["width"]<=w+2 and box["y"]+box["height"]<=h+2,box
    rects=d.locator(".leena-prop").evaluate_all("""els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})""")
    for i,a in enumerate(rects):
      for b in rects[i+1:]:
        assert min(a["x"]+a["w"],b["x"]+b["w"])-max(a["x"],b["x"])<=0 or min(a["y"]+a["h"],b["y"]+b["h"])-max(a["y"],b["y"])<=0,(w,h,rects)
    p.add_script_tag(path="node_modules/axe-core/axe.min.js")
    violations=p.evaluate("""async()=>{const report=await axe.run(document.querySelector('#bf-leena-dialog'));return report.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,description:v.description,nodes:v.nodes.map(n=>n.target)}));}""")
    assert not violations,violations
    p.screenshot(path=str(ART/f"leena_room_{w}x{h}.png"))
    for name in ["calendar","cart","phone"]:
      d.locator("[data-obj='"+name+"']").click()
      assert "Observed" in d.inner_text()
      assert d.locator(".leena-object-art img").count()==1
      p.wait_for_function("""() => {
        const im=document.querySelector('#bf-leena-dialog .leena-object-art img');
        return !!im && im.complete && im.naturalWidth===640 && im.naturalHeight===380;
      }""")
      focus_source=d.locator(".leena-object-art img").evaluate("(im)=>im.currentSrc")
      assert focus_source.endswith("leena_focus_"+name+("_mobile.svg" if w<=600 else "_wide.svg")),focus_source
      assert "Closer view of the visible" in d.locator(".leena-object-art figcaption").inner_text()
      assert_panel_heading_visible(d)
      d.locator(".leena-object-art").screenshot(path=str(ART/f"leena_object_{name}_{w}x{h}.png"))
      if name=="phone":
        assert "Nia" not in d.inner_text() and "outdoor reading" not in d.inner_text(),"Private message exposed without permission"
      d.locator('[data-choice="0"]').click()
      assert name in p.evaluate("BFLeena.state.seen")
      assert d.locator(".leena-prop.is-inspected").count()>=1
      assert d.locator(".leena-outline-"+name+".is-inspected").count()==1
      assert "inspected" in d.locator('[data-thing="'+name+'"]').inner_text().lower()
      assert p.evaluate("document.documentElement.scrollWidth-innerWidth")<=2
    assert "3 / 3" in d.inner_text()
    d.locator(".leena-scene").screenshot(path=str(ART/f"leena_scene_feedback_{w}x{h}.png"))
    d.evaluate("(el)=>{el.scrollTop=0}")
    d.get_by_role("button",name="Talk with Leena").click()
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
    assert_panel_heading_visible(d)
    assert p.evaluate("LW.S.flatIx")==original
    p.screenshot(path=str(ART/f"leena_{w}x{h}.png"))
    for _ in range(12):
      p.keyboard.press("Tab")
      assert p.evaluate("document.activeElement.closest('#bf-leena-dialog')!==null"),"Modal Tab escaped"
    d.get_by_role("button",name="Replay Leena’s story").click()
    assert p.evaluate("BFLeena.state.seen.length")==0
    assert d.locator(".leena-scene-outline.is-inspected").count()==0
    # Equivalent direct keyboard route without spatial aim.
    accessible=d.locator('[data-thing="calendar"]')
    accessible.focus()
    p.keyboard.press("Enter")
    assert d.locator("#leena-heading").inner_text()=="Calendar"
    assert p.evaluate("BFLeena.state.inspected")==["calendar"]
    assert d.locator(".leena-object-art img").count()==1
    d.get_by_role("button",name="Return without asking").click()
    d.get_by_role("button",name="Respect her space and leave").click()
    assert p.evaluate("BFLeena.state.ending")=="leave"
    d.get_by_role("button",name="Replay Leena’s story").click()
    for name in ["calendar","cart","phone"]:
      d.locator("[data-obj='"+name+"']").click();d.locator('[data-choice="1"]').click()
    d.get_by_role("button",name="Talk with Leena").click()
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
def test_evidence(browser,w,h):
  """An ending must never report facts the visitor did not witness or hear."""
  mobile=w<700
  cx=browser.new_context(viewport={"width":w,"height":h},has_touch=mobile,is_mobile=mobile)
  p=cx.new_page();errors=[];p.on("pageerror",lambda e:errors.append(str(e)))
  try:
    p.goto(URL,wait_until="load")
    p.wait_for_function("typeof window.LW?.startFlat==='function' && !!window.BFLeena")
    p.evaluate("document.querySelector('#plSkip')?.click()")
    p.locator('#mTitle .bf-dest [data-go="flats"]').click()
    p.locator("#mFlats [data-bf-leena]").click()
    d=p.locator("#bf-leena-dialog")
    # Leave without examining any object: do not invent pauses or disclosures.
    d.get_by_role("button",name="Respect her space and leave").click()
    debrief=d.locator(".leena-debrief").inner_text()
    assert "You did not examine their details." in debrief,debrief
    assert_panel_heading_visible(d)
    assert "No further personal account was shared." in debrief,debrief
    assert "pauses over Saturday" not in debrief and "October–November 2024" not in debrief,debrief
    p.screenshot(path=str(ART/f"leena_early_exit_{w}x{h}.png"))
    d.get_by_role("button",name="Replay Leena’s story").click()
    assert_panel_heading_visible(d)
    # Examining is distinct from obtaining a reply.
    d.locator("[data-obj='calendar']").click()
    d.get_by_role("button",name="Return without asking").click()
    d.get_by_role("button",name="Respect her space and leave").click()
    debrief=d.locator(".leena-debrief").inner_text()
    assert "pauses over Saturday" in debrief,debrief
    assert "half sorted" not in debrief and "mystery novel" not in debrief,debrief
    assert "No further personal account was shared." in debrief,debrief
    d.get_by_role("button",name="Replay Leena’s story").click()
    # Conversation is available without completing a prop checklist.
    d.locator("[data-obj='cart']").click()
    d.locator('[data-choice="1"]').click()
    assert p.evaluate("BFLeena.state.inspected")==["cart"]
    d.get_by_role("button",name="Talk with Leena").click()
    assert "I live with bipolar disorder" in d.inner_text()
    d.get_by_role("button",name="Leave without further questions").click()
    debrief=d.locator(".leena-debrief").inner_text()
    assert "mystery novel" in debrief and "like doing the labels" in debrief,debrief
    assert "Leena chose to say she lives with bipolar disorder" in debrief,debrief
    assert "October–November 2024" not in debrief and "April–May 2025" not in debrief,debrief
    # Test each current response as an equally available, non-scored ending.
    for answer in ["listen","support","uncertain","boundary"]:
      d.get_by_role("button",name="Replay Leena’s story").click()
      d.get_by_role("button",name="Talk with Leena").click()
      d.get_by_role("button",name="Stay with what she wants today").click()
      d.locator('[data-answer="'+answer+'"]').click()
      assert p.evaluate("BFLeena.state.ending")==answer
      assert d.locator(".leena-debrief").count()==1
    # Only the memory voluntarily opened belongs in the recorded disclosure.
    d.get_by_role("button",name="Replay Leena’s story").click()
    d.get_by_role("button",name="Talk with Leena").click()
    d.get_by_role("button",name="Ask permission to hear about earlier periods").click()
    d.locator('[data-memory="expansive"]').click()
    d.get_by_role("button",name="Return to the present").click()
    d.get_by_role("button",name="Accept that she prefers to end here").click()
    debrief=d.locator(".leena-debrief").inner_text()
    assert "April–May 2025" in debrief and "October–November 2024" not in debrief,debrief
    assert p.evaluate("BFLeena.state.heard")==["expansive"]
    d.get_by_role("button",name="Replay Leena’s story").click()
    d.get_by_role("button",name="Talk with Leena").click()
    d.get_by_role("button",name="Ask if she would rather stop talking").click()
    assert p.evaluate("BFLeena.state.ending")=="refusal"
    assert "October–November 2024" not in d.locator(".leena-debrief").inner_text()
    d.get_by_role("button",name="Return to Rooms",exact=True).click()
    assert p.locator("#mFlats [data-bf-leena]").evaluate("(el)=>document.activeElement===el")
    assert not errors,errors
    print(f"PASS Leena witness-aware branches {w}x{h}",flush=True)
  finally:cx.close()

if __name__=="__main__":
  with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path=CHROME,args=["--no-sandbox"])
    for w,h in [(360,640),(390,844),(820,1180),(1180,820),(1440,900)]:test(b,w,h)
    test(b,390,844,True)
    for w,h in [(390,844),(1440,900)]:test_evidence(b,w,h)
    b.close()
  print("ALL LEENA OPTIONAL STORY REGRESSIONS PASSED",flush=True)
