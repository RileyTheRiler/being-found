"""8.5.3: title-screen modal keyboard ownership on phone and desktop."""
import os
import shutil
import json
from playwright.sync_api import sync_playwright

BASE=os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
URL=BASE+('&' if '?' in BASE else '?')+'noopening=1'
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')

def in_title(page):
    return page.evaluate("document.activeElement?.closest('#mTitle') !== null")

def run(browser,label,width,height,mobile):
    context=browser.new_context(viewport={'width':width,'height':height},
        has_touch=mobile,is_mobile=mobile,reduced_motion='reduce')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(URL,wait_until='load')
        page.wait_for_function("window.BFTitleFocus?.active===true")
        title=page.get_by_role('dialog',name='Being Found')
        assert title.is_visible(),label+': missing labelled title dialog'
        assert page.locator('#mTitle').get_attribute('aria-modal')=='true'
        assert page.evaluate("document.activeElement?.matches('#mTitle .title-primary')"),label+': first title action did not receive focus'
        isolated=page.evaluate("""() => [...document.querySelector('#app').children]
          .filter(el=>el.id!=='mTitle')
          .every(el=>el.inert && el.getAttribute('aria-hidden')==='true')""")
        assert isolated,label+': game controls remained reachable behind title'
        for _ in range(25):
            page.keyboard.press('Tab')
            assert in_title(page),(label+': Tab escaped title '+json.dumps(page.evaluate("""() => ({active:document.activeElement?.outerHTML?.slice(0,250),own:window.BFTitleFocus?.active,appInert:document.querySelector('#app')?.inert,title:document.querySelector('#mTitle')?.className,prologueHidden:document.querySelector('#prologue')?.hidden})""")))
        for _ in range(25):
            page.keyboard.press('Shift+Tab')
            assert in_title(page),label+': Shift+Tab escaped title'
        page.locator('#mTitle details.title-more summary').click()
        for _ in range(35):
            page.keyboard.press('Tab')
            assert in_title(page),label+': Tab escaped expanded title options'
        page.get_by_role('button',name='Start the guided story').click(timeout=8000)
        assert page.locator('#clOverlay').is_visible(),label+': guided intro did not open'
        assert page.evaluate("window.BFTitleFocus.active===false"),label+': title stayed active'
        assert page.evaluate("document.querySelector('#app').inert"),label+': guided intro did not isolate app'
        assert page.evaluate("""() => [...document.querySelector('#app').children]
          .filter(el=>el.id!=='mTitle').every(el=>!el.inert)"""),label+': title left children inert after dismissal'
        page.wait_for_function("document.activeElement?.matches('#clOverlay h2') === true")
        page.get_by_role('button',name='Enter Noor’s room').click(timeout=8000)
        page.wait_for_function("window.LWClass?.stage==='noor'")
        assert not page.evaluate("document.querySelector('#app').inert"),label+': room remained inert'
        assert not page.locator('#mTitle').is_visible(),label+': title remained visible'
        assert not errors,(label,errors)
        print(label,'PASS: title semantics, modal isolation, Tab cycle, exit, guided focus handoff',flush=True)
    finally:
        context.close()

if __name__=='__main__':
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=['--no-sandbox'])
        run(browser,'phone',390,844,True)
        run(browser,'desktop',1440,900,False)
        browser.close()
    print('ALL TITLE FOCUS REGRESSIONS PASSED',flush=True)
