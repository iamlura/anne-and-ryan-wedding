"""Make the Figma flower exports transparent (they export with an #EFEFEF bg + black slot borders).
Put raw 3x PNG exports of nodes 87:111843, 87:111937, 87:112031 in tools/src/flower-1..3.png, then run: python3 flower_keyout.py"""
import numpy as np
from PIL import Image
from scipy import ndimage
BG = np.array([239,239,239], float)
def process(src, dst):
    a = np.asarray(Image.open(src).convert('RGB')).astype(float)
    # trim dark/border edges
    def dark_frac(line): return (line.mean(axis=-1) < 200).mean()
    t,b,l,r = 0,a.shape[0],0,a.shape[1]
    while dark_frac(a[t,l:r]) > .3: t+=1
    while dark_frac(a[b-1,l:r]) > .3: b-=1
    while dark_frac(a[t:b,l]) > .3: l+=1
    while dark_frac(a[t:b,r-1]) > .3: r-=1
    a = a[t:b, l:r]
    diff = np.abs(a - BG).max(axis=-1)
    near = diff < 14
    lab, n = ndimage.label(near)
    edge_labels = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:,0], lab[:,-1]]))) - {0}
    bgmask = np.isin(lab, list(edge_labels)) | (diff < 8)
    ring = ndimage.binary_dilation(bgmask, iterations=2) & ~bgmask
    alpha = np.ones(diff.shape)
    alpha[bgmask] = 0
    # color-to-alpha on the anti-aliased ring
    ca = np.clip((BG - a).max(axis=-1) / 239.0, 0, 1)
    ca = np.maximum(ca, np.clip((a - BG).max(axis=-1) / 16.0, 0, 1))
    alpha[ring] = ca[ring]
    rgb = a.copy()
    m = ring & (alpha > 0.01)
    rgb[m] = BG + (a[m] - BG) / alpha[m][:, None]
    out = np.dstack([np.clip(rgb,0,255), alpha*255]).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA')
    bbox = im.getbbox(); im = im.crop(bbox)
    im.save(dst, optimize=True); print(dst, im.size, 'trim', (t,b,l,r))
for i in (1,2,3):
    process(f'src/flower-{i}.png', f'../assets/img/flower-{i}.png')
