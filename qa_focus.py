"""Keyboard dialog regressions for the Reflect sheet on phone and desktop."""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

URL=os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
OUT=Path(os.environ.get('BF_TEST_ARTIFACTS','qa-artifacts'))
OUT.mkdir(parents=True,exist_ok=True)
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')

with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=['--no-sandbox'])
    for name,w,h in [('phone',390,844),('desktop',1440,900)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=w<600,is_mobile=w<600,reduced_motion='reduce')
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(URL,wait_until='load')
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.get_by_role('button',name='Start the guided story').click(timeout=8000)
        page.get_by_role('button',name='Enter Noor’s room').click(timeout=8000)
        reflect=page.locator('#bf83-reflect-launch')
        reflect.focus()
        page.keyboard.press('Enter')
        dialog=page.locator('#bf83-layer')
        assert dialog.is_visible(),name+' Reflect did not open'
        assert page.evaluate("document.activeElement?.classList.contains('bf83-close')"),name+' dialog did not receive focus'
        page.keyboard.press('Shift+Tab')
        assert page.evaluate("document.activeElement?.closest('#bf83-layer') !== null"),name+' focus escaped modal'
        page.keyboard.press('Escape')
        assert not dialog.is_visible(),name+' Escape did not dismiss Reflect'
        assert page.evaluate("document.activeElement?.id==='bf83-reflect-launch'"),name+' focus was not restored'
        assert not errors,(name,errors)
        page.screenshot(path=str(OUT/f'{name}-reflect-closed.png'))
        print(name,'PASS: focus entry, modal tab containment, Escape, focus restoration',flush=True)
        ctx.close()
    browser.close()
