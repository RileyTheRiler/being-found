"""Opt-in WebAudio smoke test for phone and desktop."""
import os
import shutil
from playwright.sync_api import sync_playwright

URL=os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=['--no-sandbox'])
    for name,w,h,touch in [('phone',390,844,True),('desktop',1440,900,False)]:
        ctx=browser.new_context(viewport={'width':w,'height':h},has_touch=touch,is_mobile=touch,reduced_motion='reduce')
        page=ctx.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(URL,wait_until='load')
        page.evaluate("document.querySelector('#plSkip')?.click()")
        page.get_by_role('button',name='Start the guided story').click(timeout=8000)
        page.get_by_role('button',name='Enter Noor’s room').click(timeout=8000)
        toggle=page.locator('#musicToggle')
        assert toggle.get_attribute('aria-pressed')=='false',name+' soundtrack unexpectedly enabled'
        assert not page.evaluate("window.LWAudio?.playing===true"),name+' soundtrack autoplayed'
        toggle.click(timeout=8000)
        page.wait_for_timeout(700)
        assert toggle.get_attribute('aria-pressed')=='true',name+' soundtrack did not enable'
        assert page.evaluate("window.LWAudio?.playing===true"),name+' audio engine not playing'
        page.evaluate("""() => {
          const slider=document.querySelector('#musicVolume');
          slider.value='0';
          slider.dispatchEvent(new Event('input',{bubbles:true}));
        }""")
        assert page.locator('#musicVolume').input_value()=='0',name+' volume input did not update'
        toggle.click(timeout=8000)
        page.wait_for_timeout(250)
        assert toggle.get_attribute('aria-pressed')=='false',name+' soundtrack did not mute'
        assert not page.evaluate("window.LWAudio?.playing===true"),name+' engine still playing'
        assert not errors,(name,errors)
        print(name,'PASS: no autoplay, enable, volume input, mute',flush=True)
        ctx.close()
    browser.close()
