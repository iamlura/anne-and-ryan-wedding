"""RSVP → code → RSVP flow, no stray page, and the seat line (Anne, Nov 16).
Run first:  python3 -m http.server 8765   and   python3 tools/mock_apps_script.py   (port 8766)"""
import asyncio, sys
from playwright.async_api import async_playwright
W = int(sys.argv[1]) if len(sys.argv) > 1 else 390
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--proxy-bypass-list=<-loopback>'])
        ctx = await b.new_context(viewport={'width': W, 'height': 900})
        await ctx.route('**/assets/js/config.js', lambda r: r.fulfill(content_type='application/javascript',
            body='window.WEDDING_CONFIG={SHEETS_URL:"http://127.0.0.1:8766/exec",MAX_FLOWERS:4,MAX_MESSAGE:1500};'))
        pg = await ctx.new_page(); errs = []; visited = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('framenavigated', lambda f: visited.append(f.url.split('/')[-1]) if f == pg.main_frame else None)
        await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_load_state('networkidle')
        print('nav RSVP href:', await pg.get_attribute('.nav a:has-text("RSVP")', 'href'), '| footer:', await pg.get_attribute('.footer .btn', 'href'))
        visited.clear()
        await pg.click('.footer .btn'); await pg.wait_for_url('**/invite.html*')
        await pg.fill('#code', 'AR-SOLO01'); await pg.click('#codeBtn'); await pg.wait_for_url('**/rsvp.html'); await pg.wait_for_load_state('networkidle')
        print('pages visited:', visited)
        print('B:', await pg.text_content('#partyTitle'), '|', await pg.text_content('#partySub'), '| name heading visible:', await pg.is_visible('.guest__name'), '| guests', await pg.locator('.guest').count())
        await pg.screenshot(path=f'shots/rsvp-solo-{W}.png', full_page=True)
        # direct visit without a code: redirected before the page draws anything
        await pg.evaluate('localStorage.clear()'); visited.clear()
        resp = []
        pg.on('request', lambda r: resp.append(r.url.split('/')[-1]) if r.resource_type == 'image' else None)
        await pg.goto('http://127.0.0.1:8765/rsvp.html'); await pg.wait_for_url('**/invite.html*'); await pg.wait_for_load_state('networkidle')
        print('direct visit ->', pg.url.split('/')[-1], '| rsvp images requested:', [x for x in resp if 'couple-arch' in x])
        await pg.fill('#code', 'AR-7K2QX9'); await pg.click('#codeBtn'); await pg.wait_for_url('**/rsvp.html'); await pg.wait_for_load_state('networkidle')
        print('A:', await pg.text_content('#partyTitle'), '|', await pg.text_content('#partySub'), '| names:', await pg.locator('.guest__name').all_text_contents())
        await pg.screenshot(path=f'shots/rsvp-couple-{W}.png', full_page=True)
        print('errors:', errs)
        await b.close()
asyncio.run(main())
