"""Local tool: play the whole Story Edition with random choices and report script errors.
Build first with: node editions/story/build.js
Usage: python3 editions/story/test/playthrough.py <chapter> [seed] [stop_at_chapter]
"""
import sys, asyncio, json, random, os
from playwright.async_api import async_playwright
import pathlib
URL=(pathlib.Path(__file__).resolve().parents[1]/'dist'/'index.html').as_uri()
EXITS=['Head out','Go downstairs','Lock up for the day','Leave','Say goodbye','Go home','Turn off the lamp','Leave it on','Lie down for the night','Go over to Mara']
async def run(chapter, seed=1, w=1280, h=800, shots='qa-artifacts/story-playthrough', maxsec=900, stop_at=None):
    random.seed(seed); os.makedirs(shots, exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=os.environ.get('BF_CHROME','/usr/bin/google-chrome'))
        ctx=await b.new_context(viewport={'width':w,'height':h})
        await ctx.add_init_script("localStorage.setItem('beingfound.story.settings.v1', JSON.stringify({textSpeed:3, reducedMotion:true, music:0, ambience:0, effects:0}))")
        pg=await ctx.new_page(); errs=[]
        pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
        pg.on('pageerror',lambda e: errs.append('PAGEERR: '+str(e)))
        await pg.goto(f'{URL}?chapter={chapter}&fast=5'); await pg.wait_for_timeout(800)
        tried=set(); t0=asyncio.get_event_loop().time(); n=0; last_shot=0; chapters_seen=[]; log=[]
        lastprog=asyncio.get_event_loop().time(); lastlen=0
        while asyncio.get_event_loop().time()-t0 < maxsec:
            if len(log)!=lastlen: lastlen=len(log); lastprog=asyncio.get_event_loop().time()
            elif asyncio.get_event_loop().time()-lastprog>70:
                diag=await pg.evaluate("({ch:BF.state.chapter, loc:BF.world.locId, locked:BF.story.debug.locked, exp:BF.story.debug.exploring, p:BF.world.player&&[BF.world.player.x,BF.world.player.y,BF.world.player.pose,BF.world.player.path.length,BF.world.player.seated], waits:BF.time.waits.length, paused:BF.time.paused, screen:BF.ui.screen, dlg:document.querySelector('#dialogue').className, phone:document.querySelector('#phone').className, cap:document.querySelector('#caption').className})")
                log.append(('STUCK',diag)); errs.append('STUCK '+json.dumps(diag)); await pg.screenshot(path=f"{shots}/{chapter}_{seed}_stuck.png"); break
            st=await pg.evaluate("""()=>{const q=s=>document.querySelector(s);return {
              ch:BF.state.chapter, card:q('#card').classList.contains('show'), phone:q('#phone').classList.contains('show'),
              acts:q('#actions').classList.contains('show'), dlg:q('#dialogue').classList.contains('show'),
              choices:[...document.querySelectorAll('#dlgChoices .choice')].map(b=>b.innerText), screen:BF.ui.screen,
              exp:BF.story.debug.exploring, locked:BF.story.debug.locked, objs:BF.story.debug.objects(), text:q('#dlgText').innerText, cap:q('#caption').classList.contains('show')}}""")
            if st['ch'] not in chapters_seen: chapters_seen.append(st['ch']); await pg.screenshot(path=f"{shots}/{chapter}_{seed}_{len(chapters_seen)}_{st['ch']}_start.png")
            if stop_at and st['ch']==stop_at: break
            if st['screen']=='title': log.append('TITLE'); break
            if st['card']:
                await pg.evaluate("document.querySelector('#card .card-go')&&document.querySelector('#card .card-go').click()")
            elif st['phone']:
                k=await pg.evaluate("document.querySelectorAll('#phone .ph-rep').length")
                if k: await pg.evaluate(f"(document.querySelectorAll('#phone .ph-rep')[{random.randrange(k)}]||{{click(){{}}}}).click()")
            elif st['acts']:
                await pg.evaluate("(document.querySelector('#actions .act')||{click(){}}).click()")
            elif st['dlg'] and st['choices']:
                i=random.randrange(len(st['choices'])); log.append(('CHOICE',st['text'][:50],st['choices'][i][:50]))
                await pg.evaluate(f"(document.querySelectorAll('#dlgChoices .choice')[{i}]||{{click(){{}}}}).click()")
            elif st['dlg']:
                log.append(('LINE',st['text'][:80])); await pg.evaluate("BF.ui.takeKey()")
            elif st['exp'] and not st['locked'] and st['objs']:
                cands=[(o['id'],i,a) for o in st['objs'] for i,a in enumerate(o['acts'])]
                fresh=[c for c in cands if (st['ch'],c[0],c[2]) not in tried]
                nonexit=[c for c in fresh if c[2] not in EXITS]
                pickl=nonexit or fresh or cands
                c=random.choice(pickl[:6]) if pickl is not cands else random.choice(cands)
                tried.add((st['ch'],c[0],c[2])); log.append(('ACT',c[0],c[2]))
                await pg.evaluate(f"BF.story.debug.act({json.dumps(c[0])},{c[1]})")
                n+=1
                if n%6==0: await pg.screenshot(path=f"{shots}/{chapter}_{seed}_{st['ch']}_{n:03d}.png")
            elif st['cap']:
                await pg.evaluate("BF.ui.takeKey()")
            await pg.wait_for_timeout(120)
        await pg.screenshot(path=f"{shots}/{chapter}_{seed}_end.png")
        await b.close()
        return chapters_seen, errs, log
if __name__=='__main__':
    ch=sys.argv[1]; seed=int(sys.argv[2]) if len(sys.argv)>2 else 1; stop=sys.argv[3] if len(sys.argv)>3 else None
    seen,errs,log=asyncio.run(run(ch,seed,stop_at=stop))
    print('chapters:',seen); print('errors:',len(errs)); [print(' ',e) for e in errs[:15]]
    json.dump([list(map(str,l)) if isinstance(l,tuple) else l for l in log], open(f'qa-artifacts/story-log-{ch}-{seed}.json','w'))
    print('steps:',len(log)); [print(' ',l) for l in log[-12:]]
