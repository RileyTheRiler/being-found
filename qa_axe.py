"""Axe-core 4.14.1 audit at real guided UI checkpoints (not a screen-reader test).

Run after npm ci, npm run build and a local dist server. Serious and critical
violations fail CI. Save full machine-readable evidence in qa-artifacts/.
"""
import json
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE=os.environ.get('BF_TEST_URL','http://127.0.0.1:8770/index.html')
URL=BASE+('&' if '?' in BASE else '?')+'noopening=1'
AXE=Path(__file__).resolve().parent/'node_modules/axe-core/axe.min.js'
OUT=Path(os.environ.get('BF_TEST_ARTIFACTS','qa-artifacts'))
CHROME=os.environ.get('BF_CHROME') or shutil.which('google-chrome') or shutil.which('chromium')
OUT.mkdir(parents=True,exist_ok=True)

def scan(page,name,records):
    result=page.evaluate("""async () => {
      const result=await axe.run(document,{runOnly:{
        type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']
      }});
      return {
        version:axe.version,
        violations:result.violations.map(v=>({
          id:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,
          nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,20)
        })),
        incomplete:result.incomplete.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length})),
        passes:result.passes.length
      };
    }""")
    serious=[v for v in result['violations'] if v['impact'] in ('serious','critical')]
    result.update(stage=name,severe=len(serious))
    records.append(result)
    print(name,'axe',result['version'],'serious/critical',len(serious),
          'other',len(result['violations'])-len(serious),'incomplete',len(result['incomplete']),flush=True)
    for v in serious:
        print('  ',v['impact'],v['id'],[n['target'] for n in v['nodes'][:6]],flush=True)

def open_guide(page,mobile):
    if mobile and not page.locator('#clGuide .cl-guide-fold').is_visible():
        page.locator('#bf-guide-toggle').click()
    if page.locator('#clGuide [data-cl="guideshow"]').is_visible():
        page.locator('#clGuide [data-cl="guideshow"]').click()

def run(browser,label,width,height,mobile,records):
    ctx=browser.new_context(viewport={'width':width,'height':height},
        has_touch=mobile,is_mobile=mobile,reduced_motion='reduce')
    page=ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    try:
        page.goto(URL,wait_until='load')
        page.add_script_tag(path=str(AXE))
        page.wait_for_function("window.BFTitleFocus?.active===true")
        scan(page,label+'/title',records)
        page.get_by_role('button',name='Start the guided story').click(timeout=8000)
        page.wait_for_function("!document.querySelector('#clOverlay').hidden")
        scan(page,label+'/guided-intro',records)
        page.get_by_role('button',name='Enter Noor’s room').click(timeout=8000)
        page.wait_for_function("window.LWClass?.stage==='noor'")
        scan(page,label+'/noor-room',records)
        open_guide(page,mobile)
        page.locator('#clGuide .cl-guide-skip[data-cl="dele"]').click(timeout=8000)
        page.wait_for_function("window.LWClass?.stage==='between'")
        scan(page,label+'/bridge-to-dele',records)
        page.locator('#clOverlay [data-cl="deledo"]').click(timeout=8000)
        page.wait_for_function("window.LWDele?.state?.stage==='door'")
        scan(page,label+'/dele-door',records)
        page.locator('#dlMoves [data-dla="askenter"]').click(timeout=8000)
        page.wait_for_function("window.LWDele?.state?.stage==='inside'")
        scan(page,label+'/dele-encounter',records)
        page.locator('#dlMoves [data-dla="leave"]').click(timeout=8000)
        page.wait_for_function("window.LWDele?.state?.stage==='ended'")
        page.locator('#dlMoves [data-dla="reflect"]').click()
        page.locator('#dlCard [data-dlu="note"]').click()
        page.locator('#dlCard [data-dlu="classRoom"]').click()
        page.wait_for_function("window.LWClass?.stage==='waltbridge'")
        scan(page,label+'/bridge-to-walt',records)
        page.locator('#clOverlay [data-cl="walt"]').click(timeout=8000)
        page.wait_for_function("window.LWClass?.stage==='walt'")
        scan(page,label+'/walt-encounter',records)
        page.evaluate("window.LWClass.toFinal()")
        page.wait_for_function("window.LWClass?.stage==='complete'")
        scan(page,label+'/final-reflection',records)
        assert not errors,(label,errors)
    finally:
        ctx.close()

def main():
    if not AXE.is_file():
        raise SystemExit('Missing axe-core bundle: run npm ci before qa_axe.py')
    records=[]
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,executable_path=CHROME,args=['--no-sandbox'])
            try:
                run(browser,'phone',390,844,True,records)
                run(browser,'desktop',1440,900,False,records)
            finally:
                browser.close()
    finally:
        (OUT/'axe-8.5.3.json').write_text(json.dumps(records,indent=2,ensure_ascii=False),encoding='utf-8')
    failing=[r for r in records if r['severe']]
    if failing:
        print('AXE FAILED: serious/critical findings at',[(r['stage'],r['severe']) for r in failing],flush=True)
        return 1
    print('AXE PASSED: zero serious/critical violations across',len(records),'real guided checkpoints',flush=True)
    return 0

if __name__=='__main__':
    raise SystemExit(main())
