"""Invite-code flow test against the local mock backend.
Run first:  python3 -m http.server 8765   and   python3 tools/mock_apps_script.py   (port 8766)
Mock codes: AR-7K2QX9 (Santos Family, table 5), AR-PL5ONE (Racquel Ochoa and Plus One), AR-SOLO01 (Celine Zamora, one seat)."""
import asyncio, sys
from playwright.async_api import async_playwright
W = int(sys.argv[1]) if len(sys.argv) > 1 else 1920
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--proxy-bypass-list=<-loopback>'])
        ctx = await b.new_context(viewport={'width': W, 'height': 1000})
        await ctx.route('**/assets/js/config.js', lambda r: r.fulfill(content_type='application/javascript',
            body='window.WEDDING_CONFIG={SHEETS_URL:"http://127.0.0.1:8766/exec",MAX_FLOWERS:4,MAX_MESSAGE:1500};'))
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        shot = lambda n: pg.screenshot(path=f'shots/{n}-{W}.png', full_page=True)
        await pg.goto('http://127.0.0.1:8765/rsvp.html'); await pg.wait_for_load_state('networkidle')
        print('no session ->', pg.url.split('/')[-1])
        await shot('gate')
        await pg.fill('#code', 'AR-WRONG1'); await pg.click('#codeBtn'); await pg.wait_for_timeout(500)
        print('wrong code err visible:', await pg.is_visible('#codeErr')); await shot('gate-wrong')
        await pg.click('text=Forgot your code?'); await pg.fill('#femail', 'maria@example.com'); await pg.click('#forgotBtn'); await pg.wait_for_timeout(500)
        print('sent:', await pg.text_content('#sentMsg')); await shot('gate-sent')
        await pg.click('text=Enter My Code'); await pg.fill('#code', 'ar 7k2qx9'); await pg.click('#codeBtn'); await pg.wait_for_url('**/rsvp.html'); await pg.wait_for_load_state('networkidle')
        await pg.evaluate("document.querySelectorAll('[data-fade]').forEach(e=>e.classList.add('in'))")
        print('rsvp party:', await pg.text_content('#partyTitle'), '| guests', await pg.locator('.guest').count())
        await pg.click('.guest[data-i="0"] .pill:has-text("Joyfully")'); await pg.fill('#food0', 'None')
        await pg.click('.guest[data-i="1"] .pill:has-text("Respectfully")')
        await shot('rsvp-loggedin')
        await pg.click('#rsvpSubmit'); await pg.wait_for_timeout(800)
        print('done:', await pg.text_content('#rsvpTitle'), '|', await pg.text_content('#rsvpDoneText'))
        await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_load_state('networkidle')
        print('welcome:', await pg.text_content('[data-welcome]'), '| continue visible', await pg.is_visible('[data-continue]'))
        await pg.goto('http://127.0.0.1:8765/details.html'); await pg.wait_for_load_state('networkidle')
        print('table:', await pg.is_visible('[data-table]'), await pg.text_content('[data-table-val]'))
        # email link straight in, plus one party, earlier answers come back
        await pg.goto('http://127.0.0.1:8765/invite.html?code=AR-PL5ONE&next=rsvp.html'); await pg.wait_for_url('**/rsvp.html'); await pg.wait_for_load_state('networkidle')
        print('link login:', await pg.text_content('#partyTitle'))
        await pg.click('.guest[data-i="0"] .pill:has-text("Joyfully")'); await pg.fill('#food0', 'Vegetarian')
        await pg.click('.guest[data-i="1"] .pill:has-text("Joyfully")'); await pg.fill('#food1', 'None')
        print('needs plus-one name, disabled:', await pg.is_disabled('#rsvpSubmit'))
        await pg.fill('#pn1', 'Test Guest'); await pg.click('#rsvpSubmit'); await pg.wait_for_timeout(800)
        await pg.goto('http://127.0.0.1:8765/invite.html?code=AR-PL5ONE&next=rsvp.html'); await pg.wait_for_url('**/rsvp.html'); await pg.wait_for_load_state('networkidle')
        print('answers kept:', await pg.input_value('#pn1'), await pg.input_value('#food0'))
        print('errors:', errs)
        await b.close()
asyncio.run(main())
