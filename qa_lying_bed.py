"""Browser regression for playable and NPC lying poses in the replacement room.

The authored bed must show a resident's head resting on a pillow, not an
upright full-body sprite over the duvet. Screenshots require visual review.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
ART = Path(os.environ.get("BF_TEST_ARTIFACTS", "qa-artifacts"))
ART.mkdir(parents=True, exist_ok=True)
CHROME = os.environ.get("BF_CHROME") or shutil.which("google-chrome") or shutil.which("chromium")
VIEWPORTS = (
    ("phone", 390, 844, True),
    ("tablet-portrait", 820, 1180, True),
    ("tablet-landscape", 1180, 820, True),
    ("desktop", 1440, 900, False),
)


def check(browser, label, width, height, touch, kind):
    ctx = browser.new_context(viewport={"width": width, "height": height},
                              is_mobile=touch and min(width, height) < 600,
                              has_touch=touch, reduced_motion="reduce")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    try:
        page.goto(URL + ("&" if "?" in URL else "?") + "noopening=1", wait_until="load")
        page.wait_for_function("typeof window.LW?.startFlat === 'function' && !!window.BFRoom")
        page.evaluate("""() => {
            LWPrologue?.finish?.();
            LW.closeModals();
            window.__bedQA={heads:[],uprightLies:[]};
            const head=BFArt.drawHead, actor=BFArt.drawActor;
            BFArt.drawHead=function(ctx,x,y,o,env){
                window.__bedQA.heads.push({x,y,lying:!!o.lying});
                return head.call(this,ctx,x,y,o,env);
            };
            BFArt.drawActor=function(ctx,x,y,o,env){
                if(o?.pose==='lie')window.__bedQA.uprightLies.push({x,y});
                return actor.call(this,ctx,x,y,o,env);
            };
        }""")
        if kind == "npc":
            page.evaluate("() => LW.startVisit(2)")
            page.wait_for_function("LW.S.npc?.pose==='lie' && LW.S.npc?.at==='bed'")
        else:
            page.evaluate("() => LW.startFlat(2)")
            page.wait_for_function("LW.S.sim?.pose==='lie' && LW.S.sim?.at==='bed'")
        page.wait_for_timeout(300)
        page.evaluate("() => { BFRoom.navigate('sleeping'); window.__bedQA.heads=[]; window.__bedQA.uprightLies=[]; }")
        page.wait_for_timeout(500)
        evidence = page.evaluate("() => ({...window.__bedQA, room:BFRoom.selected, pose:LW.S.sim.pose, npc:LW.S.npc?.pose})")
        page.locator("#cv").screenshot(path=str(ART / f"lying-bed-{label}-{kind}.png"))
        assert evidence["room"] == "sleeping", (label,kind,"wrong camera",evidence)
        assert any(h["lying"] and 740 <= h["x"] <= 802 and 420 <= h["y"] <= 475
                   for h in evidence["heads"]), (label,kind,"missing pillow-anchored head",evidence)
        assert not evidence["uprightLies"], (label,kind,"upright full-body lying actor",evidence)
        assert not errors, (label,kind,errors)
        # A small JPEG from the actual rendered canvas enables visual inspection
        # of the four distinct viewport/occupant cases via CI logs.
        if (label,kind) in {("phone","player"),("tablet-portrait","npc"),
                           ("tablet-landscape","player"),("desktop","npc")}:
            snapshot=page.evaluate("""() => {
                const src=document.querySelector('#cv'), out=document.createElement('canvas');
                out.width=560;out.height=Math.max(1,Math.round(560*src.height/src.width));
                out.getContext('2d').drawImage(src,0,0,out.width,out.height);
                return out.toDataURL('image/jpeg',.68).split(',')[1];
            }""")
            print(f"BED_IMAGE {label} {kind} {snapshot}",flush=True)
        print(f"PASS: {label} {kind} lying head, depth, no upright pose",flush=True)
    finally:
        ctx.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME, args=["--no-sandbox"])
        try:
            for label, width, height, touch in VIEWPORTS:
                for kind in ("player", "npc"):
                    check(browser, label, width, height, touch, kind)
        finally:
            browser.close()
    print("LYING BED PRESENTATION QA PASSED")
