"""Story Edition smoke test: every chapter starts, plays random interactions and choices, and raises no page errors.

Runs against the built site (dist/story/index.html). Uses BF_TEST_URL's host and BF_CHROME like the root suite.
This checks script integrity across branches. It is not a substitute for real-device, assistive-technology
or lived-experience review.
"""
import asyncio, json, os, random, sys
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

base = os.environ.get("BF_TEST_URL", "http://127.0.0.1:8770/index.html")
u = urlsplit(base)
URL = f"{u.scheme}://{u.netloc}/story/index.html"
CHROME = os.environ.get("BF_CHROME")
ART = os.environ.get("BF_TEST_ARTIFACTS", "qa-artifacts")
CHAPTERS = ["prologue", "noor", "door", "leena", "dele", "walt", "outside"]
EXITS = {"Head out", "Go downstairs", "Lock up for the day", "Leave", "Say goodbye", "Go home", "Turn off the lamp", "Leave it on", "Lie down for the night", "Go over to Mara"}
SETTINGS = "localStorage.setItem('beingfound.story.settings.v1', JSON.stringify({textSpeed:3, reducedMotion:true, music:0, ambience:0, effects:0}))"
STATE = """()=>{const q=s=>document.querySelector(s);return {ch:BF.state.chapter, card:q('#card').classList.contains('show'),
 phone:q('#phone').classList.contains('show'), acts:q('#actions').classList.contains('show'), dlg:q('#dialogue').classList.contains('show'),
 choices:document.querySelectorAll('#dlgChoices .choice').length, exp:BF.story.debug.exploring, locked:BF.story.debug.locked, objs:BF.story.debug.objects(), screen:BF.ui.screen}}"""

async def chapter(browser, ch, w, h, seconds, seed):
    rnd = random.Random(seed)
    ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2 if w < 600 else 1)
    await ctx.add_init_script(SETTINGS)
    pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and not m.text.startswith("Failed to load resource") else None)
    await pg.goto(f"{URL}?chapter={ch}&fast=6")
    await pg.wait_for_timeout(600)
    acted, tried, t = 0, set(), 0.0
    while t < seconds:
        st = await pg.evaluate(STATE)
        if st["ch"] != ch or st["screen"] == "title": break
        if st["card"]: await pg.evaluate("(document.querySelector('#card .card-go')||{click(){}}).click()")
        elif st["phone"]: await pg.evaluate(f"(document.querySelectorAll('#phone .ph-rep')[{rnd.randrange(4)}]||document.querySelector('#phone .ph-rep')||{{click(){{}}}}).click()")
        elif st["acts"]: await pg.evaluate("(document.querySelector('#actions .act')||{click(){}}).click()")
        elif st["dlg"] and st["choices"]: await pg.evaluate(f"(document.querySelectorAll('#dlgChoices .choice')[{rnd.randrange(st['choices'])}]||{{click(){{}}}}).click()")
        elif st["dlg"]: await pg.evaluate("BF.ui.takeKey()")
        elif st["exp"] and not st["locked"] and st["objs"]:
            cands = [(o["id"], i, a) for o in st["objs"] for i, a in enumerate(o["acts"])]
            fresh = [c for c in cands if (c[0], c[2]) not in tried and c[2] not in EXITS] or cands
            c = rnd.choice(fresh); tried.add((c[0], c[2])); acted += 1
            await pg.evaluate(f"BF.story.debug.act({json.dumps(c[0])},{c[1]})")
        await pg.wait_for_timeout(150); t += .2
    os.makedirs(ART, exist_ok=True)
    await pg.screenshot(path=f"{ART}/story-{ch}-{w}x{h}.png")
    await ctx.close()
    return errs, acted

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME) if CHROME else await p.chromium.launch()
        failures = []
        runs = [(c, 1280, 800, 20) for c in CHAPTERS] + [("noor", 390, 844, 15), ("walt", 390, 844, 15)]
        for i, (ch, w, h, sec) in enumerate(runs):
            errs, acted = await chapter(browser, ch, w, h, sec, seed=i + 1)
            ok = not errs and (acted > 0 or ch == "prologue")
            print(f"{'PASS' if ok else 'FAIL'}: story {ch} {w}x{h} actions={acted} errors={len(errs)}")
            for e in errs[:5]: print("   ", e)
            if not ok: failures.append(ch)
        await browser.close()
    if failures: sys.exit("Story Edition smoke failed: " + ", ".join(failures))
    print("PASS: Story Edition chapters start, play and raise no page errors")

asyncio.run(main())
