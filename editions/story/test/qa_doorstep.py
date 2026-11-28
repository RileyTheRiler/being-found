"""Deterministic Story Edition doorway -> library -> Dele evening browser paths.

Only rendered controls advance the game. Read-only state checks synchronize
actions; legacy fixtures seed v1 storage before starting the library.
"""
import os
import time
from urllib.parse import urljoin

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, expect, sync_playwright

URL = urljoin(os.getenv("BF_TEST_URL", "http://127.0.0.1:8770/index.html"), "story/index.html")
SAVE = "beingfound.story.save.v1"
KNOCK = "Mine’s been long. I knocked on a friend’s door this morning."
KNOCK_RECORD = "Told Leena she knocked on a friend’s door."
NOTE = "Mine’s been long. I left a note at a friend’s door this morning."
NOTE_RECORD = "Told Leena she left a note at a friend’s door."
HOME = "Mine’s been long. I was outside a friend’s door this morning."
HOME_RECORD = "Told Leena she was outside a friend’s door."
NO_KNOCK = "Mine’s been long. I was outside a friend’s door this morning, but I didn’t knock."
NO_KNOCK_RECORD = "Told Leena she was outside a friend’s door and did not knock."
OLD = "Told Leena about the knock, and no more than that."
CASES = {
    "direct-home": (NO_KNOCK, "Did you want to knock?", "I think so. I don’t know if he wanted me to.", [NO_KNOCK_RECORD, "Told Leena she thought she wanted to knock, but didn’t know if her friend wanted her to."]),
    "direct-note": (NOTE, "Did you knock?", "No. I just left the note.", [NOTE_RECORD, "Told Leena she did not knock."]),
    "knock-note": (KNOCK, "Did they answer?", "I left before anyone answered. I slid a note under the door.", [KNOCK_RECORD, "Told Leena she left a note before anyone answered."]),
    "knock-home": (KNOCK, "Did they answer?", "I went home before anyone answered.", [KNOCK_RECORD, "Told Leena she went home before anyone answered."]),
    "refusal": (KNOCK, "Did they answer?", "He did. He said not today. Which is allowed.", [KNOCK_RECORD, "Told Leena her friend answered and said not today."]),
    "invitation": (KNOCK, "Did they answer?", "He did. He let me in. I’m still thinking about it.", [KNOCK_RECORD, "Told Leena her friend answered and let her in."]),
    "skip": ("Mine’s been long. I’ve got a lot on my mind.", None, None, []),
    "legacy-note": (NOTE, "Did you speak to them?", "No. I left a note in the end.", [NOTE_RECORD, "Told Leena she did not speak to her friend."]),
    "legacy-home": (HOME, "Did you speak to them?", "No. I went home in the end.", [HOME_RECORD, "Told Leena she went home without speaking to her friend."]),
}


def until(page, predicate, label):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if predicate():
            return
        next_button = page.locator("#dialogue.show #dlgNext:not([hidden])")
        card_button = page.locator("#card.show .card-go")
        # A chapter transition can dismiss a previously visible dialogue.
        # Recheck on that race, without invoking debug or hidden controls.
        control = card_button if card_button.is_visible() else next_button
        if control.is_visible():
            try:
                control.click(timeout=1000)
            except PlaywrightTimeoutError:
                if control.is_visible() and not (control is next_button and card_button.is_visible()):
                    raise
        else:
            page.wait_for_timeout(80)
    raise AssertionError(f"Timed out: {label}; dialogue={page.locator('#dlgText').inner_text()!r}")


def choice(page, label):
    button = page.locator("#dialogue.show #dlgChoices").get_by_role("button", name=label, exact=True)
    until(page, button.is_visible, label)
    button.click()


def hotspot(page, chapter, name):
    button = page.locator("#hotspots").get_by_role("button", name=name, exact=True)
    def ready():
        return page.evaluate("(ch) => BF.state.chapter === ch && !!BF.story.exploring && !BF.story.locked", chapter) and button.count() == 1
    until(page, ready, f"{chapter}: {name}")
    return button


def action(page, chapter, name, label):
    hotspot(page, chapter, name).press("Enter")
    page.locator("#actions.show").get_by_role("button", name=label, exact=True).click()


def door(page, route):
    page.goto(URL + "?chapter=door&fast=6")
    if route == "skip":
        page.get_by_role("button", name="Content note", exact=True).click()
        page.get_by_role("button", name="Skip this chapter", exact=True).click()
        return
    if route == "direct-home":
        action(page, "door", "Door 2B", "Go home")
        return
    if route == "direct-note":
        action(page, "door", "Door 2C", "Leave a note instead")
        choice(page, "“I’m across the landing. N.”")
        return
    action(page, "door", "Door 2C", "Knock")
    if route in ("knock-note", "knock-home"):
        choice(page, "Leave it")
        choice(page, "Write him a note" if route == "knock-note" else "Go home")
        if route == "knock-note":
            choice(page, "“I’m across the landing. N.”")
        return
    choice(page, "Wait")
    if route == "refusal":
        choice(page, "She mentioned you. I wanted to come anyway.")
        choice(page, "Can I come in for ten minutes?")
    else:
        choice(page, "I can go, if today isn’t good.")
        action(page, "door", "Front door", "Say goodbye")
        choice(page, "Okay. I’m right across the landing.")


def legacy(page, route):
    page.goto(URL)
    record = {"version": 1, "chapter": "leena", "from": None, "state": {
        "flags": {"deleOutcome": route.removeprefix("legacy-"), "know_noor": ["An unrelated earlier observation."]},
        "completed": ["prologue", "noor", "door"], "notebook": ["about"], "log": [],
    }}
    page.evaluate("([key, record]) => localStorage.setItem(key, JSON.stringify(record))", [SAVE, record])
    page.goto(URL + "?chapter=leena&fast=6")


def check(browser, route, disclosure="answer"):
    width, height = (390, 844) if route == "direct-home" else (1440, 900) if route == "invitation" else (1180, 820)
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
    try:
        context.add_init_script("""localStorage.setItem('beingfound.story.settings.v1', JSON.stringify({
          textSpeed:3, reducedMotion:true, notebookPrompts:false, music:0, ambience:0, effects:0
        }))""")
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" and not m.text.startswith("Failed to load resource") else None)
        if route.startswith("legacy-"):
            legacy(page, route)
        else:
            door(page, route)
        action(page, "leena", "Returns cart", "Shelve the next book")
        action(page, "leena", "Returns cart", "Shelve the next book")
        choice(page, "Monday’s fine. I’ll leave the wall empty for it.")
        choice(page, "Quiet so far.")
        intro, question, reply, expected = CASES[route]
        if disclosure == "answer" and question:
            choice(page, question)
        elif disclosure == "nohave":
            choice(page, "You don’t have to tell me.")
        else:
            choice(page, "Do you want to talk about it?")
        hotspot(page, "leena", "Library door")
        page.get_by_role("button", name="Notebook", exact=True).click()
        notebook = page.locator(".nb-view")
        expect(notebook).to_be_visible()
        # Match the exact rendered heading; a role query can omit it while
        # the Notebook screen is becoming visible.
        entries = notebook.locator('section.person:has(> h4:text-is("Noor")) li')
        want = expected if disclosure == "answer" else expected[:1]
        if route.startswith("legacy-"):
            want = ["An unrelated earlier observation."] + want
        expect(entries).to_have_count(len(want))
        actual = entries.all_text_contents()
        assert actual == want, f"{route}/{disclosure}: Notebook actual={actual!r}, expected={want!r}"
        for entry in entries.all():
            expect(entry).to_be_visible()
        artifacts = os.getenv("BF_TEST_ARTIFACTS", "qa-artifacts")
        os.makedirs(artifacts, exist_ok=True)
        page.screenshot(path=os.path.join(artifacts, f"doorstep-{route}-{disclosure}.png"), animations="disabled")
        assert OLD not in notebook.inner_text()
        page.get_by_role("button", name="Close", exact=True).click()
        log = page.evaluate("BF.state.log")
        noor = [line["text"] for line in log if line["who"] == "Noor"]
        assert intro in noor, (route, noor)
        if reply:
            assert (reply in noor) == (disclosure == "answer"), (route, disclosure, noor)
        if route == "skip":
            assert not any("friend’s door" in line for line in noor), noor
        flags = page.evaluate("BF.state.flags")
        assert not flags.get("sawApril") and not flags.get("sawOctober"), flags
        if route == "invitation" and disclosure == "answer":
            for label in ("Open your planner", "Look at the April page", "Look at the October page"):
                action(page, "leena", "Your planner", label)
                page.get_by_role("button", name="Close the planner").click()
                hotspot(page, "leena", "Your planner")
            assert page.evaluate("BF.state.flags.sawApril && BF.state.flags.sawOctober")
        action(page, "leena", "Library door", "Lock up for the day")
        hotspot(page, "dele", "Phone")
        if route == "skip":
            action(page, "dele", "Front door", "Stand by the door")
            hotspot(page, "dele", "Phone")
            page.get_by_role("button", name="Notebook", exact=True).click()
            page.get_by_role("button", name="When possibilities change").click()
            expect(notebook).to_contain_text("From Dele’s landing")
            assert not page.evaluate("BF.state.flags.openedDoor")
        if route == "invitation" and disclosure == "answer":
            replay_without_visit(page, expected, legacy=False)
        if route == "refusal" and disclosure == "answer":
            replay_without_visit(page, expected, legacy=True)
        assert not errors, errors
        print(f"PASS {route}/{disclosure}: exact Notebook, Noor dialogue, optional recollections, Dele evening", flush=True)
    finally:
        context.close()


def replay_without_visit(page, previous, legacy):
    earned = set(page.evaluate("BF.state.notebook"))
    if not legacy:
        assert "time" in earned, earned
    if legacy:
        # Model a save written before chapter-entry snapshots existed.
        page.evaluate("""key => {
            const record = JSON.parse(localStorage.getItem(key));
            delete record.chapterEntries;
            record.state.flags.know_dele = ['His bike has had a flat tyre since August.', 'Opened the door when Noor knocked.'];
            record.state.notebook.push('background');
            localStorage.setItem(key, JSON.stringify(record));
        }""", SAVE)
    page.goto(URL + "?fast=6")
    page.get_by_role("button", name="Notebook", exact=True).click()
    entries = page.locator('.nb-view section.person:has(> h4:text-is("Noor")) li')
    expect(entries).to_have_text(previous)
    page.get_by_role("button", name="Close", exact=True).click()
    page.get_by_role("button", name="Chapters", exact=True).click()
    page.locator("li.chap").filter(has_text="Behind the Door").get_by_role("button", name="Play").click()
    page.get_by_role("button", name="Content note", exact=True).click()
    page.get_by_role("button", name="Skip this chapter", exact=True).click()
    hotspot(page, "leena", "Returns cart")
    page.goto(URL + "?fast=6")
    page.get_by_role("button", name="Continue").click()
    hotspot(page, "leena", "Returns cart")
    page.get_by_role("button", name="Notebook", exact=True).click()
    expect(page.locator(".nb-view")).to_be_visible()
    expect(entries).to_have_count(0)
    if legacy:
        expect(page.locator('.nb-view section.person:has(> h4:text-is("Dele")) li')).to_have_text(
            ["His bike has had a flat tyre since August."])
        assert "background" in page.evaluate("BF.state.notebook")
    assert earned <= set(page.evaluate("BF.state.notebook")), (earned, page.evaluate("BF.state.notebook"))
    if not legacy:
        page.get_by_role("button", name="A future that opens and closes").click()
        expect(page.locator(".nb-view")).to_contain_text("Every plan assumes a future")
    assert not page.evaluate("BF.state.flags.sawApril || BF.state.flags.sawOctober")
    print(f"PASS replay and Continue, legacy={legacy}: no prior disclosures or recollections", flush=True)


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.getenv("BF_CHROME"))
        selected = os.getenv("BF_DOORSTEP_CASE")
        if selected:
            check(browser, selected)
        else:
            for route in CASES:
                check(browser, route)
            check(browser, "refusal", "talk")
            check(browser, "invitation", "nohave")
        browser.close()
