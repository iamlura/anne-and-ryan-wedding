import asyncio, os, json, random
from playwright.async_api import async_playwright
W=int(os.environ.get('W','1440'))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(proxy={'server': os.environ['HTTPS_PROXY']}, args=['--proxy-bypass-list=<-loopback>;localhost;127.0.0.1'])
        ctx = await b.new_context(viewport={'width': W, 'height': 900 if W>600 else 860}, has_touch=W<600)
        pg = await ctx.new_page()
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('http://127.0.0.1:8765/message.html')
        # seed 9 notes
        seed=[]
        names=['Mia','Paolo','Tita Baby','Jun','Bea','Carlo','Lola Nena','Sam','Ivy']
        for i,n in enumerate(names):
            fl=[{'f':random.choice([1,2,3]),'x':0.35+0.1*k,'y':0.55,'r':(k-1.5)*25} for k in range(random.randint(0,4))]
            seed.append({'id':f's{i}','from':n,'text':f'Congrats from {n}!\n\nWishing you a lifetime of love.','font':['serif','sans','script'][i%3],'size':'m','flowers':fl,'pos':random.random()*0.6,'t':1000+i})
        await pg.evaluate(f"localStorage.setItem('ar_messages', {json.dumps(json.dumps(seed))})")
        await pg.reload(); await pg.wait_for_timeout(800)
        await pg.screenshot(path=f'shots/f1-home-{W}.png')
        await pg.click('[data-go=write]')
        await pg.fill('#from','Laura')
        await pg.fill('#body','Dear Anne and Ryan,\n\nI’m so happy for you and I wish nothing but a blessed marriage for the both of you.\n\nNothing but love for the both of you.')
        await pg.click('#writeNext')
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'shots/f2-arrange-empty-{W}.png')
        bq = await pg.locator('#bouquet').bounding_box()
        for k,(slot,fx) in enumerate([(1,0.4),(3,0.5),(2,0.6),(3,0.45),(1,0.55)]):
            s = await pg.locator(f'.slot[data-flower="{slot}"]').bounding_box()
            await pg.mouse.move(s['x']+s['width']/2, s['y']+s['height']/2); await pg.mouse.down()
            await pg.mouse.move(bq['x']+bq['width']*fx, bq['y']+bq['height']*0.25, steps=8); await pg.mouse.up()
            await pg.wait_for_timeout(100)
        n = await pg.locator('#bouquet .fl:not(.ghost)').count()
        print('flowers placed', n)
        await pg.locator('#bouquet').scroll_into_view_if_needed()
        await pg.screenshot(path=f'shots/f3-arrange-{W}.png', full_page=True)
        await pg.click('[data-go=place]'); await pg.wait_for_timeout(500)
        mine = await pg.locator('.pin.is-mine').bounding_box()
        st = await pg.locator('#stagePlace').bounding_box()
        await pg.mouse.move(mine['x']+mine['width']/2, mine['y']+mine['height']/2); await pg.mouse.down()
        await pg.mouse.move(st['x']+st['width']*0.3, st['y']+st['height']*0.15, steps=10); await pg.mouse.up()
        await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'shots/f4-place-{W}.png', full_page=True)
        await pg.click('#sendBtn'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'shots/f5-home-after-{W}.png', full_page=True)
        for i in range(5): await pg.click('h1[data-secret-tap]')
        await pg.fill('#pw','111111'); await pg.click('#pwForm button[type=submit]'); await pg.wait_for_timeout(500)
        print('wrong pw msg:', await pg.text_content('#pwErr'))
        await pg.fill('#pw','261226'); await pg.click('#pwForm button[type=submit]'); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'shots/f6-inbox-{W}.png')
        await pg.click('#viewer .note'); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'shots/f7-letter-{W}.png')
        print('counter', await pg.text_content('#counter'))
        async with pg.expect_download(timeout=30000) as dl:
            await pg.click('#dlOne')
        d = await dl.value
        await d.save_as(f'shots/note-{W}.pdf'); print('pdf saved', d.suggested_filename)
        print('errors', errs)
        await b.close()
asyncio.run(main())
