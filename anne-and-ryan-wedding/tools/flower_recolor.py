# Recolour the lavender flower PNGs to the theme (Nov 19). Usage: put the lavender originals in fl/flower-N.png, run, results in fl/new-N.png.
import numpy as np, sys, colorsys
from PIL import Image
# target per flower: (hue deg, sat mult, value mult)
T={1:(348,1.3,1.0), 2:(354,2.3,0.78), 3:(352,2.1,0.86)}
def run(src,dst,i):
    im=np.array(Image.open(src).convert('RGBA')).astype(float)/255
    rgb=im[...,:3]; mx=rgb.max(-1); mn=rgb.min(-1); d=mx-mn
    r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
    h=np.zeros_like(mx); m=d>1e-6
    hr=np.where(mx==r,((g-b)/np.where(m,d,1))%6,np.where(mx==g,(b-r)/np.where(m,d,1)+2,(r-g)/np.where(m,d,1)+4))*60
    h=np.where(m,hr,0); s=np.where(mx>0,d/np.where(mx>0,mx,1),0); v=mx
    sel=(h>235)&(h<310)&(s>0.08)&(v>0.25)
    th,sm,vm=T[i]
    h2=np.where(sel,th,h); s2=np.where(sel,np.clip(s*sm,0,1),s); v2=np.where(sel,np.clip(v*vm,0,1),v)
    # hsv->rgb
    hh=(h2/60)%6; c=v2*s2; x=c*(1-abs(hh%2-1)); z=np.zeros_like(c)
    k=np.floor(hh).astype(int)
    rp=np.choose(k,[c,x,z,z,x,c]); gp=np.choose(k,[x,c,c,x,z,z]); bp=np.choose(k,[z,z,x,c,c,x])
    mm=v2-c; out=np.stack([rp+mm,gp+mm,bp+mm],-1)
    im[...,:3]=np.where(sel[...,None],out,rgb)
    Image.fromarray((im*255).round().astype(np.uint8)).save(dst,optimize=True)
    print(i,sel.sum())
for i in (1,2,3): run(f'fl/flower-{i}.png',f'fl/new-{i}.png',i)
