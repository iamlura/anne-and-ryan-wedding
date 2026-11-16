// use_figma script (reference copy). Set CARRIERS to temporary rectangles whose image fill is a PNG with a tEXt
// chunk holding {key,name,x,y,root,styles} from capture.py. Returns per screen: frame id + [imageIndex, nodeId] pairs
// to upload the crops into.
const CARRIERS = [/* "123:4", ... */];
const page = await figma.getNodeByIdAsync("224:2");
await figma.setCurrentPageAsync(page);
const NAVV = await figma.getNodeByIdAsync("216:7"), PILL = await figma.getNodeByIdAsync("217:2");
async function readData(id) {
  const r = await figma.getNodeByIdAsync(id);
  const b = await figma.getImageByHash(r.fills[0].imageHash).getBytesAsync();
  let i = 8;
  while (i < b.length) {
    const len = (b[i] << 24 | b[i+1] << 16 | b[i+2] << 8 | b[i+3]) >>> 0;
    const type = String.fromCharCode(b[i+4], b[i+5], b[i+6], b[i+7]);
    if (type === "tEXt") { const parts = []; for (let k = i + 10; k < i + 8 + len; k += 8192) parts.push(String.fromCharCode.apply(null, b.subarray(k, Math.min(k + 8192, i + 8 + len)))); return JSON.parse(parts.join("")); }
    i += 12 + len;
  }
}
const paint = c => ({ type: "SOLID", color: { r: c[0], g: c[1], b: c[2] }, opacity: c[3] == null ? 1 : c[3] });
const place = (n, r, pr) => { n.x = r[0] - pr[0]; n.y = r[1] - pr[1]; };
const rotate = (n, r, pr, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), w = r[2], h = r[3]; const cx = r[0] - pr[0] + w / 2, cy = r[1] - pr[1] + h / 2; n.relativeTransform = [[c, -s, cx - (c * w / 2 - s * h / 2)], [s, c, cy - (s * w / 2 + c * h / 2)]]; };
const radii = (n, br) => { if (br) { n.topLeftRadius = br[0]; n.topRightRadius = br[1]; n.bottomRightRadius = br[2]; n.bottomLeftRadius = br[3]; } };
const results = [];
for (const cid of CARRIERS) {
  const D = await readData(cid), S = D.styles;
  await Promise.all([...new Set(S.map(s => s.f + "|" + s.s))].map(k => { const [family, style] = k.split("|"); return figma.loadFontAsync({ family, style }); }));
  const ctx = { imgs: [] };
  const build = (n, parent, pr) => {
    const W = Math.max(0.01, n.r[2]), H = Math.max(0.01, n.r[3]);
    if (n.t === "b") {
      const f = figma.createFrame(); f.name = "Frame"; parent.appendChild(f); f.resize(W, H);
      f.fills = n.bg ? [paint(n.bg)] : [];
      if (n.bw) { f.strokes = [paint(n.bc || [0, 0, 0, 1])]; f.strokeAlign = "INSIDE"; const [t, r, b, l] = n.bw; if (t === r && r === b && b === l) f.strokeWeight = t; else { f.strokeTopWeight = t; f.strokeRightWeight = r; f.strokeBottomWeight = b; f.strokeLeftWeight = l; } }
      radii(f, n.br);
      if (n.sh) { const [ox, oy, bl, sp, c] = n.sh; f.effects = [{ type: "DROP_SHADOW", color: { r: c[0], g: c[1], b: c[2], a: c[3] }, offset: { x: ox, y: oy }, radius: bl, spread: sp, visible: true, blendMode: "NORMAL" }]; }
      f.clipsContent = !!n.clip; if (n.op != null) f.opacity = n.op;
      if (n.rot) rotate(f, n.r, pr, n.rot); else place(f, n.r, pr);
      if (n.img != null) ctx.imgs.push([n.img, f.id]);
      for (const k of n.c || []) build(k, f, n.r);
    } else if (n.t === "x") {
      const t = figma.createText(); parent.appendChild(t);
      const s0 = S[n.runs[0][1]]; t.fontName = { family: s0.f, style: s0.s };
      t.characters = n.runs.map(r => r[0]).join("");
      let off = 0;
      for (const [str, si] of n.runs) { const st = S[si], e = off + str.length; if (e > off) {
        t.setRangeFontName(off, e, { family: st.f, style: st.s }); t.setRangeFontSize(off, e, st.z); t.setRangeFills(off, e, [paint(st.c)]);
        t.setRangeLetterSpacing(off, e, { unit: "PIXELS", value: st.ls });
        t.setRangeTextCase(off, e, st.tt === "uppercase" ? "UPPER" : st.tt === "lowercase" ? "LOWER" : st.tt === "capitalize" ? "TITLE" : "ORIGINAL");
        t.setRangeTextDecoration(off, e, st.td === "U" ? "UNDERLINE" : "NONE"); } off = e; }
      if (n.lh) t.lineHeight = { unit: "PIXELS", value: n.lh };
      t.textAlignHorizontal = n.al; t.textAutoResize = "HEIGHT"; t.resize(W, t.height);
      if (n.op != null) t.opacity = n.op; place(t, n.r, pr);
    } else if (n.t === "i") {
      const r = figma.createRectangle(); r.name = "image"; parent.appendChild(r); r.resize(W, H);
      r.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.85 } }]; radii(r, n.br); if (n.op != null) r.opacity = n.op;
      if (n.rot) rotate(r, n.r, pr, n.rot); else place(r, n.r, pr);
      ctx.imgs.push([n.img, r.id]);
    } else if (n.t === "s") {
      const src = n.src.includes("monogram-nav") ? NAVV : n.src.includes("monogram-pill") ? PILL : null; if (!src) return;
      const c = src.clone(); parent.appendChild(c); c.rescale(W / c.width); if (n.op != null) c.opacity = n.op; place(c, n.r, pr);
    }
  };
  const root = figma.createFrame(); page.appendChild(root);
  root.name = D.name; root.resize(D.root.r[2], D.root.r[3]); root.x = D.x; root.y = D.y;
  root.fills = D.root.bg ? [paint(D.root.bg)] : []; root.clipsContent = true;
  for (const k of D.root.c) build(k, root, D.root.r);
  results.push({ key: D.key, id: root.id, imgs: ctx.imgs });
}
return results;
