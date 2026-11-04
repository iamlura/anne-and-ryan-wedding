import asyncio, sys, os
from playwright.async_api import async_playwright
pages = sys.argv[1].split(',')
w = int(sys.argv[2]); full = sys.argv[3] == 'full' if len(sys.argv)>3 else True
os.makedirs('shots', exist_ok=True)
async def main():
    async with async_playwright() as p:
        proxy = {'server': os.environ['HTTPS_PROXY'], 'bypass': 'localhost,127.0.0.1'} if os.environ.get('HTTPS_PROXY') else None
        b = await p.chromium.launch(proxy=proxy, args=['--ignore-certificate-errors','--proxy-bypass-list=<-loopback>;localhost;127.0.0.1'])
        ctx = await b.new_context(viewport={'width': w, 'height': 900 if w > 600 else 860}, device_scale_factor=1, ignore_https_errors=True, bypass_csp=True)
        for name in pages:
            pg = await ctx.new_page()
            errs = []
            pg.on('console', lambda m: errs.append(m.text) if m.type in ('error','warning') else None)
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            await pg.goto(f'http://127.0.0.1:8765/{name}.html', wait_until='networkidle')
            await pg.evaluate("document.querySelectorAll('[data-fade]').forEach(e=>e.classList.add('in')); document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
            await pg.wait_for_load_state('networkidle')
            await pg.wait_for_timeout(600)
            path = f'shots/{name}-{w}.png'
            await pg.screenshot(path=path, full_page=full)
            print(name, w, 'errors:', errs[:5])
        await b.close()
asyncio.run(main())
