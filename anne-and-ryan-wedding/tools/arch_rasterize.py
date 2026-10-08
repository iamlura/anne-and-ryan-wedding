"""Rasterize the Figma arch SVG export (Group 817, node 87:64805) to a transparent WebP.
Usage: python3 arch_rasterize.py arch.svg ../assets/img/arch.webp
Before running, delete the two background <rect>s at the top of the SVG (#1E1E1E and #EFEFEF)."""
import asyncio, sys, os
from playwright.async_api import async_playwright
from PIL import Image
src, dst = os.path.abspath(sys.argv[1]), sys.argv[2]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1920, 'height': 1652})
        await pg.goto('file://' + src)
        await pg.screenshot(path='arch_tmp.png', omit_background=True)
        await b.close()
asyncio.run(main())
Image.open('arch_tmp.png').save(dst, 'WEBP', quality=85); os.remove('arch_tmp.png'); print('wrote', dst)
