import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(proxy={'server': os.environ['HTTPS_PROXY']}, args=['--proxy-bypass-list=<-loopback>;localhost;127.0.0.1'])
        ctx = await b.new_context(viewport={'width':1280,'height':900})
        async def cfg(route):
            await route.fulfill(content_type='application/javascript', body='window.WEDDING_CONFIG={SHEETS_URL:"http://127.0.0.1:8766/exec",MAX_FLOWERS:4,MAX_MESSAGE:1500};')
        await ctx.route('**/assets/js/config.js', cfg)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('http://127.0.0.1:8765/rsvp.html')
        print('submit disabled initially', await pg.is_disabled('#rsvpSubmit'))
        await pg.fill('#name','Jane Doe'); await pg.fill('#email','jane@x.com'); await pg.click('label.radio:has-text("Yes")')
        print('disabled w/o food', await pg.is_disabled('#rsvpSubmit'))
        await pg.fill('#food','None'); print('disabled w/ food', await pg.is_disabled('#rsvpSubmit'))
        await pg.click('#rsvpSubmit'); await pg.wait_for_timeout(800)
        print('done text:', await pg.text_content('#rsvpDoneText'))
        await pg.goto('http://127.0.0.1:8765/message.html'); await pg.wait_for_timeout(500)
        print('demo badge present', await pg.locator('.demo-badge').count())
        await pg.click('[data-go=write]'); await pg.fill('#from','Laura'); await pg.fill('#body','Hello you two!')
        await pg.click('#writeNext'); await pg.click('[data-go=place]'); await pg.wait_for_timeout(300)
        await pg.click('#sendBtn'); await pg.wait_for_timeout(1000)
        print('pins on arch', await pg.locator('#stageHome .pin').count())
        await pg.click('[data-go=write]'); await pg.fill('#from','Troll'); await pg.fill('#body','you are bobo')
        await pg.click('#writeNext'); print('filter msg:', await pg.text_content('#writeErr'))
        print('errors', errs)
        await b.close()
asyncio.run(main())
