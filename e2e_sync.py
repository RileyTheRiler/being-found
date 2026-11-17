from pathlib import Path
from playwright.sync_api import sync_playwright
import json,base64,re,os,shutil,sys
root=Path(__file__).parent
html=(root/'dist/index.html').read_text()
dist=root/'dist'
html=re.sub(r'<link rel="stylesheet" href="/?([\w.-]+\.css)(?:\?v=[^"]*)?">',lambda m:'<style>'+(dist/m.group(1)).read_text()+'</style>',html)
html=re.sub(r'<script defer src="/?([\w.-]+\.js)(?:\?v=[^"]*)?"></script>',lambda m:'<script>'+(dist/m.group(1)).read_text()+'</script>',html)
assets={c:'data:image/webp;base64,'+base64.b64encode((root/'assets'/f'{c}_atlas.webp').read_bytes()).decode() for c in ['noor','dele','tomas']}
html=html.replace('</head>','<script>window.__BFRigAssetOverrides='+json.dumps(assets)+';</script></head>')
ports=[tuple(map(int,x.split('x'))) for x in sys.argv[1:]] or [(1024,1366)]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium'),args=['--no-sandbox','--disable-web-security'])
 for w,h in ports:
  ctx=b.new_context(viewport={'width':w,'height':h});page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda route:route.abort())
  page.set_content(html,wait_until='domcontentloaded',timeout=30000)
  page.evaluate("document.querySelector('#plSkip')?.click()")
  page.get_by_role('button',name='Start the guided story').click(timeout=7000)
  page.get_by_role('button',name='Enter Noor’s room').click(timeout=7000)
  page.wait_for_timeout(600)
  def snap():return page.evaluate('''() => {const S=LW.S;return {...BFStageSync.snapshot(S),navX:BFNavigation.x,navActive:BFNavigation.active,at:S.sim.at,pose:S.sim.pose,simAct:!!S.sim.act,clock:S.clock,panels:document.querySelectorAll('[data-bf-followup]').length,rigDraws:BFRig.totalDraws};}''')
  start=snap();assert start['version']=='8.1' and start['rigDraws']>0 and start['breakfast']=='untouched',start
  page.locator('#bf-room-nav [data-room="kitchen"]').click()
  page.locator('.pin[data-obj="stove"]').click(timeout=6000)
  page.get_by_role('button',name='Fry an egg').click(timeout=6000)
  page.get_by_role('button',name='Try',exact=True).click(timeout=6000)
  page.wait_for_timeout(1550)
  page.get_by_role('button',name='Continue the action').click(timeout=6000)
  page.wait_for_timeout(4400)
  active=snap()
  # At slow frame rate the native 2D walk can still be in progress.
  assert active['navX']>700 and active['rigDraws']>10,active
  page.wait_for_timeout(5300)
  after=snap();assert after['at']=='stove' and after['panels']==2 and after['breakfast']=='used' and not after['navActive'],after
  page.screenshot(path=str(root/f'v81_{w}_{h}_pan_used.png'))
  page.get_by_role('button',name='Wash the pan').click(timeout=6000)
  page.wait_for_timeout(130)
  washed=snap();assert washed['breakfast']=='washed',washed
  page.screenshot(path=str(root/f'v81_{w}_{h}_pan_washed.png'))
  # Validate a new room action still has the original travel and story behavior.
  page.locator('#bf-room-nav [data-room="living"]').click(timeout=6000)
  page.wait_for_timeout(400)
  page.locator('.pin[data-obj="sofa"]').click(timeout=6000)
  page.get_by_role('button',name='Sit down for a minute').click(timeout=6000)
  page.wait_for_timeout(7300)
  seated=snap();assert seated['at']=='sofa' and seated['pose']=='sit' and not seated['navActive'],seated
  page.screenshot(path=str(root/f'v81_{w}_{h}_seated.png'))
  # The two sessions are independent; false positives from old browser state should not cross screens.
  assert not errors,errors
  print(json.dumps({'viewport':f'{w}x{h}','start':start,'active':active,'after':after,'washed':washed,'seated':seated,'errors':errors}),flush=True)
  ctx.close()
 b.close()
