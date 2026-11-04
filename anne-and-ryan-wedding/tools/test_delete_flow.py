"""Guest deletes their own letter. Runs in demo mode, then against tools/mock_apps_script.py (port 8766).
   python3 -m http.server 8765 (from the site folder) ; python3 mock_apps_script.py & ; python3 test_delete_flow.py"""
import asyncio
from playwright.async_api import async_playwright


async def run(p, backend):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': 1440, 'height': 900})
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    if backend:
        async def cfg(route):
            await route.fulfill(body="window.WEDDING_CONFIG={SHEETS_URL:'http://127.0.0.1:8766/exec',MAX_FLOWERS:4,MAX_MESSAGE:1500};",
                                content_type='application/javascript')
        await pg.route('**/config.js', cfg)
    await pg.goto('http://127.0.0.1:8765/message.html')
    await pg.wait_for_timeout(500)
    await pg.click('[data-go="write"]')
    await pg.fill('#from', 'Delete Me')
    await pg.fill('#body', 'Congratulations to you both!')
    await pg.click('#writeNext'); await pg.wait_for_timeout(300)
    await pg.click('.arrange-next'); await pg.wait_for_timeout(400)
    await pg.click('#sendBtn'); await pg.wait_for_timeout(1500)
    before = await pg.locator('#stageHome .pin').count()
    own = pg.locator('#stageHome .pin.is-own')
    print('backend' if backend else 'demo', '| pins', before, '| own', await own.count())
    await own.first.hover()
    await own.first.locator('.del').click()
    print('  modal open', await pg.locator('#delModal.open').count())
    await pg.click('#delConfirm'); await pg.wait_for_timeout(1200)
    print('  pins after', await pg.locator('#stageHome .pin').count(),
          '| mine', await pg.evaluate("localStorage.getItem('ar_mine')"),
          '| toast', await pg.text_content('.toast'))
    await pg.reload(); await pg.wait_for_timeout(1200)
    print('  pins after reload', await pg.locator('#stageHome .pin').count(), '| errors', errs)
    await b.close()


async def main():
    async with async_playwright() as p:
        await run(p, False)
        await run(p, True)

asyncio.run(main())
