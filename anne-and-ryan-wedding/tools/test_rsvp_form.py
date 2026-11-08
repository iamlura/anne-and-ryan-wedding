"""RSVP page -> Google Form. Uses the real config.js but intercepts the formResponse POST (nothing reaches Google)."""
import asyncio, os
from urllib.parse import parse_qs
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await (await b.new_context(viewport={'width': 1440, 'height': 900})).new_page()
        errs, sent = [], []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        async def form(route):
            sent.append(parse_qs(route.request.post_data or ''))
            await route.fulfill(status=200, body='ok')
        await pg.route('**/formResponse', form)
        await pg.goto('http://127.0.0.1:8765/rsvp.html')
        cfg = await pg.evaluate('window.WEDDING_CONFIG.RSVP_FORM')
        await pg.fill('#name', 'Jane Doe'); await pg.fill('#email', 'jane@x.com')
        await pg.click('label.radio:has-text("Joyfully accepts")'); await pg.fill('#food', 'none')
        await pg.click('#rsvpSubmit'); await pg.wait_for_timeout(1500)
        done = await pg.locator('#rsvpDone').is_visible()
        s = sent[0] if sent else {}
        print('sent', len(sent), '| name', s.get(cfg['name']), '| attending', s.get(cfg['attending']), '| food', s.get(cfg['food']), '| done shown', done, '| errors', errs)
        await b.close()
asyncio.run(main())
