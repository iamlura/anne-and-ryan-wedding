"""RSVP by last name (Nov 17): not found, one match, several matches (pick), answer, thank-you.
Run first:  python3 -m http.server 8765   and   python3 tools/mock_apps_script.py   (port 8766)
Usage: python3 tools/test_rsvp_flow.py [width]   (screenshots go to tools/shots/)"""
import asyncio, sys, os
from playwright.async_api import async_playwright
W = int(sys.argv[1]) if len(sys.argv) > 1 else 390
os.makedirs('shots', exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--proxy-bypass-list=<-loopback>'])
        ctx = await b.new_context(viewport={'width': W, 'height': 1080 if W > 760 else 844})
        await ctx.route('**/assets/js/config.js', lambda r: r.fulfill(content_type='application/javascript',
            body='window.WEDDING_CONFIG={SHEETS_URL:"http://127.0.0.1:8766/exec",MAX_FLOWERS:4,MAX_MESSAGE:1500};'))
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('http://127.0.0.1:8765/index.html'); await pg.wait_for_load_state('networkidle')
        print('footer RSVP ->', await pg.get_attribute('.footer .btn', 'href'))
        await pg.click('.footer .btn'); await pg.wait_for_url('**/rsvp.html'); await pg.wait_for_load_state('networkidle')
        print('find step visible:', await pg.is_visible('[data-rstep=find]'), '| label:', await pg.text_content('label[for=last]'))
        await pg.screenshot(path=f'shots/rsvp-find-{W}.png', full_page=True)
        await pg.fill('#last', 'Smith'); await pg.click('#findBtn'); await pg.wait_for_selector('#findHint.is-error'); await pg.wait_for_timeout(700)
        print('not found:', await pg.text_content('#findHint'))
        await pg.screenshot(path=f'shots/rsvp-notfound-{W}.png', full_page=True)
        await pg.fill('#last', 'zamora'); await pg.click('#findBtn'); await pg.wait_for_selector('[data-rstep=pick].is-active'); await pg.wait_for_timeout(700)
        print('pick:', await pg.text_content('#pickText'), await pg.locator('#pickList button').all_text_contents())
        await pg.screenshot(path=f'shots/rsvp-pick-{W}.png', full_page=True)
        await pg.click('#pickList button:has-text("Celine")'); await pg.wait_for_selector('[data-rstep=party].is-active')
        print('party:', await pg.text_content('#partyTitle'), '|', await pg.text_content('#partySub'))
        await pg.click('[data-rstep=party] [data-again]'); await pg.wait_for_selector('[data-rstep=find].is-active')
        await pg.fill('#last', 'Ochoa'); await pg.press('#last', 'Enter'); await pg.wait_for_selector('[data-rstep=party].is-active')
        print('one match opens directly:', await pg.text_content('#partyTitle'), '| names:', await pg.locator('.guest__name').all_text_contents())
        await pg.screenshot(path=f'shots/rsvp-party-{W}.png', full_page=True)
        rad = pg.locator('.guest').nth(0); await rad.locator('text=Joyfully accepts').click(); # dietary left empty on purpose: it's optional (Nov 19)
        await pg.locator('.guest').nth(1).locator('text=Respectfully declines').click()
        await pg.click('#rsvpSubmit'); await pg.wait_for_selector('.rsvp-done.is-active'); await pg.wait_for_timeout(900)
        print('done:', await pg.text_content('#rsvpTitle'), '|', await pg.text_content('#rsvpDoneText'))
        await pg.evaluate('window.scrollTo(0,0)'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'shots/rsvp-done-{W}.png', full_page=True)
        await pg.reload(); await pg.wait_for_load_state('networkidle')
        print('reload reopens invitation:', await pg.is_visible('[data-rstep=party]'), '| answers kept:', await pg.is_checked('input[name=att0][value=Yes]'))
        await pg.goto('http://127.0.0.1:8765/invite.html?code=AR-7K2QX9'); await pg.wait_for_url('**/rsvp.html')
        print('old invite link ->', pg.url.split('/')[-1])
        print('errors:', errs)
        await b.close()
asyncio.run(main())
