"""Offline PWA regression on a served production build (Chromium; physical Safari still required)."""
import json, os, shutil
from playwright.sync_api import sync_playwright
URL=os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=CHROME if CHROME else None,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':820,'height':1180},service_workers='allow')
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(URL,wait_until='load')
    page.evaluate("""async () => {
      await navigator.serviceWorker.ready;
      const registration=await navigator.serviceWorker.getRegistration();
      if(!registration?.active)throw Error('Offline worker inactive');
      const keys=await caches.keys();
      const cache=await caches.open(keys.find(k=>k.startsWith('bf-offline-')));
      for(const url of ['/index.html','/leena.js','/bf83.css','/manifest.webmanifest']){
        if(!await cache.match(url))throw Error('Not cached: '+url);
      }
    }""")
    context.set_offline(True)
    page.reload(wait_until='load')
    page.wait_for_timeout(400)
    assert page.locator('#scene').count()==1,'Game shell unavailable offline'
    assert page.get_by_role('button',name='Start the guided story').count()==1,'Offline title unavailable'
    page.get_by_role('button',name='Start the guided story').click()
    assert not errors,errors
    print(json.dumps({'offlineReload':'PASS','gameStart':'PASS','errors':errors}))
    browser.close()
