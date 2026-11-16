"""Load every phone screen state and save its layout JSON (plus a reference screenshot)."""
import asyncio, json, sys
from playwright.async_api import async_playwright
B = 'http://127.0.0.1:8765/'
CFG = 'window.WEDDING_CONFIG={SHEETS_URL:"http://127.0.0.1:8766/exec",MAX_FLOWERS:4,MAX_MESSAGE:1500};'
JS = open('tools/figma_phone/extract.js').read()
ONLY = sys.argv[1:]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--proxy-bypass-list=<-loopback>'])
        c = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        await c.route('**/assets/js/config.js', lambda r: r.fulfill(content_type='application/javascript', body=CFG))
        pg = await c.new_page()

        async def settle():
            await pg.wait_for_load_state('networkidle')
            await pg.evaluate("document.querySelectorAll('img').forEach(i=>i.loading='eager')")
            await pg.evaluate("Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))")
            await pg.evaluate("window.scrollTo(0,document.body.scrollHeight)"); await pg.wait_for_timeout(300)
            await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(300)

        async def grab(name):
            if ONLY and name not in ONLY: return
            await pg.evaluate("window.scrollTo(0,0)")
            await pg.screenshot(path=f'/tmp/figma_phone_out/{name}.png', full_page=True)
            data = await pg.evaluate(JS)
            json.dump(data, open(f'/tmp/figma_phone_out/{name}.json', 'w'))
            print(name, data['root']['r'], len(json.dumps(data)) // 1024, 'KB', len(data['images']), 'images')

        async def fresh(url):  # each grab mutates the DOM, so reload before the next state
            await pg.goto(url); await settle()

        for n in ['index', 'story', 'details', 'faq', 'message']:
            await fresh(B + n + '.html'); await grab('pub-' + n)
        await fresh(B + 'index.html'); await pg.click('[data-burger]'); await pg.wait_for_timeout(500); await grab('nav-open')
        await fresh(B + 'invite.html'); await grab('gate-code')
        await fresh(B + 'invite.html'); await pg.fill('#code', 'AR-WRONG1'); await pg.click('#codeBtn'); await pg.wait_for_timeout(600); await grab('gate-wrong')
        await fresh(B + 'invite.html'); await pg.click('text=Forgot your code?'); await pg.wait_for_timeout(300); await pg.fill('#femail', 'jane.doe@gmail.com'); await grab('gate-forgot')
        await fresh(B + 'invite.html'); await pg.click('text=Forgot your code?'); await pg.fill('#femail', 'jane.doe@gmail.com'); await pg.click('#forgotBtn'); await pg.wait_for_timeout(600); await grab('gate-sent')
        await fresh(B + 'invite.html'); await pg.fill('#code', 'AR-7K2QX9'); await pg.click('#codeBtn'); await pg.wait_for_url('**/index.html'); await settle(); await grab('in-index')
        await fresh(B + 'details.html'); await grab('in-details')
        await fresh(B + 'rsvp.html')
        await pg.click('.guest[data-i="0"] .pill:has-text("Joyfully")'); await pg.fill('#food0', 'None')
        await pg.click('.guest[data-i="1"] .pill:has-text("Joyfully")'); await pg.fill('#food1', 'Vegetarian'); await pg.wait_for_timeout(300)
        await grab('in-rsvp')
        await pg.click('#rsvpSubmit'); await pg.wait_for_timeout(900); await grab('in-rsvp-sent')
        await b.close()

asyncio.run(main())
