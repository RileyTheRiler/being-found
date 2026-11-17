"""Persistent save/resume regression across reloads and optional sandbox play."""
import json
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
        page.wait_for_timeout(500)
        before=page.evaluate("""() => {
          const raw=JSON.parse(localStorage.getItem('lifeworld.v1')||'{}');
          return {mode:LW.S.mode,flat:LW.S.flat?.name,saved:raw.cur||null};
        }""")
        assert before['mode']=='play' and before['flat']=='Noor' and before['saved'] and before['saved']['flatIx']==0,before
        # Visiting Sandbox must not erase a saved room or silently convert a save to Sandbox.
        page.evaluate('LW.startSandbox()')
        sandbox=page.evaluate("""() => ({mode:LW.S.mode,saved:JSON.parse(localStorage.getItem('lifeworld.v1')||'{}').cur||null})""")
        assert sandbox['mode']=='sandbox' and sandbox['saved'] and sandbox['saved']['flatIx']==0,sandbox
        page.reload(wait_until='load')
        page.evaluate("document.querySelector('#plSkip')?.click()")
        continue_button=page.get_by_role('button',name='Continue Noor’s room')
        continue_button.click(timeout=8000)
        page.wait_for_timeout(450)
        after=page.evaluate("""() => ({
          mode:LW.S.mode,flat:LW.S.flat?.name,
          saved:JSON.parse(localStorage.getItem('lifeworld.v1')||'{}').cur||null
        })""")
        assert after['mode']=='play' and after['flat']=='Noor' and after['saved'],after
        assert not errors,errors
        page.screenshot(path=str(OUT/f'{name}-resumed.png'))
        print(json.dumps({'viewport':name,'start':before,'sandbox':sandbox,'resume':after,'pageErrors':errors},ensure_ascii=False,default=str),flush=True)
        ctx.close()
    browser.close()
print('SAVE / RESUME REGRESSION PASSED')
