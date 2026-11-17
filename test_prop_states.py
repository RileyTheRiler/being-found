from pathlib import Path
from playwright.sync_api import sync_playwright
import json,base64,re
root=Path(__file__).parent
html=(root/'dist/index.html').read_text()
dist=root/'dist'
html=re.sub(r'<link rel="stylesheet" href="/?([\w.-]+\.css)(?:\?v=[^"]*)?">',lambda m:'<style>'+(dist/m.group(1)).read_text()+'</style>',html)
html=re.sub(r'<script defer src="/?([\w.-]+\.js)(?:\?v=[^"]*)?"></script>',lambda m:'<script>'+(dist/m.group(1)).read_text()+'</script>',html)
assets={c:'data:image/webp;base64,'+base64.b64encode((root/'assets'/f'{c}_atlas.webp').read_bytes()).decode() for c in ['noor','dele','tomas']}
html=html.replace('</head>','<script>window.__BFRigAssetOverrides='+json.dumps(assets)+';</script></head>')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security'])
 page=b.new_page(viewport={'width':1194,'height':834});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.route('**/*',lambda route:route.abort())
 page.set_content(html,wait_until='domcontentloaded',timeout=30000)
 page.evaluate("document.querySelector('#plSkip')?.click()")
 page.get_by_role('button',name='Start the guided story').click(timeout=6000)
 page.get_by_role('button',name='Enter Noor’s room').click(timeout=6000)
 page.wait_for_timeout(300)
 info=page.evaluate('''() => {
   const S=LW.S;
   const before={snap:BFStageSync.snapshot(S),people:S.vars.people,friction:S.vars.friction};
   BFStageSync.begin({obj:'phone',a:{id:'call',kind:'shared'},st:'open'},S);
   S.sim.at='phone';S.sim.act={kind:'shared'};S.sim.prog=.68;S.sim.dur=1;
   const phone={snap:BFStageSync.snapshot(S),rigFrame:BFStageSync.frame(S,{bfMainActor:true}),shouldHold:BFStageSync.phoneHeld(S)};
   S.sim.act=null;BFStageSync.finish({obj:'phone',a:{id:'call'}},false,S);
   S.fx.painted=.8;
   const painting={snap:BFStageSync.snapshot(S)};
   const preserved={people:S.vars.people,friction:S.vars.friction};
   BFStageSync.reset(S);
   return {before,phone,painting,preserved,tag:document.querySelector('#bf-build-label')?.textContent};
 }''')
 assert info['phone']['shouldHold'] and info['phone']['rigFrame']==['phone',12],info
 assert abs(info['painting']['snap']['painted']-.25/.45)<.03,info
 assert info['before']['people']==info['preserved']['people'] and info['before']['friction']==info['preserved']['friction'],info
 # The reset must not wipe out the native painting progress.
 after=page.evaluate('''() => BFStageSync.snapshot(LW.S)''')
 assert after['painted']>0 and after['current'] is None,after
 page.screenshot(path=str(root/'v81_1194_834_paint_test.png'))
 assert not errors,errors
 print(json.dumps({'states':info,'reset':after,'errors':errors}),flush=True)
 b.close()
