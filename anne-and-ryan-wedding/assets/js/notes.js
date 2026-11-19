/* Notes: envelope + bouquet rendering, and the flower-arch path used for snapping.
   All arch math is in Figma units of the 1920 x 1652 arch artwork. */
(function () {
  const FLOWERS = {
    1: { src: "assets/img/flower-1.png?v=2", aspect: 204 / 618, h: 0.56 },
    2: { src: "assets/img/flower-2.png?v=2", aspect: 203 / 618, h: 0.56 },
    3: { src: "assets/img/flower-3.png?v=2", aspect: 252 / 661, h: 0.6 }
  };

  /* data: { from, flowers:[{f,x,y,r}] }  width: any CSS length */
  function renderNote(data, width) {
    const el = document.createElement("div");
    el.className = "note";
    if (width) el.style.setProperty("--w", width);
    (data.flowers || []).forEach((fl, i) => el.appendChild(renderFlower(fl, i)));
    const env = document.createElement("div");
    env.className = "env";
    env.innerHTML = '<img class="body" src="assets/img/env-body.svg" alt="" draggable="false"><img class="flap" src="assets/img/env-flap.svg" alt="" draggable="false"><span class="from"></span>';
    env.querySelector(".from").textContent = data.from ? "From " + data.from : "";
    el.appendChild(env);
    return el;
  }

  function renderFlower(fl, i) {
    const meta = FLOWERS[fl.f] || FLOWERS[1];
    const d = document.createElement("div");
    d.className = "fl";
    d.dataset.i = i;
    d.style.left = fl.x * 100 + "%";
    d.style.top = fl.y * 100 + "%";
    d.style.height = meta.h * 100 + "%";
    d.style.width = meta.h * 0.9 * meta.aspect * 100 + "%";
    d.style.rotate = (fl.r || 0) + "deg";
    d.style.setProperty("--r", (fl.r || 0) + "deg");
    d.innerHTML = '<img src="' + meta.src + '" alt="" draggable="false">';
    return d;
  }

  /* ---------- arch path ---------- */
  const A = { W: 1920, H: 1652, cx: 960, cy: 988.658, R: 822.945, xl: 137.055, xr: 1782.95, yb: 1540 };
  const L1 = A.yb - A.cy, L2 = Math.PI * A.R, L = L1 * 2 + L2;

  // arc length s -> point {x,y} in design units
  function pointAt(s) {
    s = Math.max(0, Math.min(L, s));
    if (s <= L1) return { x: A.xl, y: A.yb - s };
    if (s <= L1 + L2) { const th = Math.PI - (s - L1) / A.R; return { x: A.cx + A.R * Math.cos(th), y: A.cy - A.R * Math.sin(th) }; }
    return { x: A.xr, y: A.cy + (s - L1 - L2) };
  }

  // nearest arc length for a point in design units
  function nearestS(x, y) {
    const cands = [];
    // left vertical
    const yl = Math.max(A.cy, Math.min(A.yb, y));
    cands.push({ s: A.yb - yl, d: Math.hypot(x - A.xl, y - yl) });
    // right vertical
    const yr = Math.max(A.cy, Math.min(A.yb, y));
    cands.push({ s: L1 + L2 + (yr - A.cy), d: Math.hypot(x - A.xr, y - yr) });
    // arc (upper half)
    let th = Math.atan2(A.cy - y, x - A.cx);           // 0 = right, PI/2 = top
    if (th < 0) th = x < A.cx ? Math.PI : 0;
    const px = A.cx + A.R * Math.cos(th), py = A.cy - A.R * Math.sin(th);
    cands.push({ s: L1 + (Math.PI - th) * A.R, d: Math.hypot(x - px, y - py) });
    cands.sort((a, b) => a.d - b.d);
    return cands[0].s;
  }

  /* Spread notes along the path without overlap, moving each as little as possible
     (pool-adjacent-violators on s_i - i*gap). Deterministic, so every guest sees the same arch. */
  function layout(items, gapPref) {
    const n = items.length;
    if (!n) return [];
    const gap = Math.min(gapPref, L / Math.max(1, n));
    const order = items.map((it, i) => ({ i, s: it.s, k: it.k || 0 }))
      .sort((a, b) => a.s - b.s || a.k - b.k);
    const y = order.map((o, j) => o.s - j * gap);
    // PAV for non-decreasing fit
    const blocks = [];
    y.forEach((v) => {
      blocks.push({ sum: v, cnt: 1 });
      while (blocks.length > 1 && blocks[blocks.length - 2].sum / blocks[blocks.length - 2].cnt > blocks[blocks.length - 1].sum / blocks[blocks.length - 1].cnt) {
        const b = blocks.pop(); blocks[blocks.length - 1].sum += b.sum; blocks[blocks.length - 1].cnt += b.cnt;
      }
    });
    const fit = [];
    blocks.forEach((b) => { for (let c = 0; c < b.cnt; c++) fit.push(b.sum / b.cnt); });
    const maxY = Math.max(0, L - (n - 1) * gap);
    const out = new Array(n);
    order.forEach((o, j) => { out[o.i] = Math.max(0, Math.min(maxY, fit[j])) + j * gap; });
    return out;
  }

  /* Envelope tilt: left half of the arch leans one way, right half the mirror (as in the Figma:
     left envelope 41° counter-clockwise, right one about 32° clockwise). Amount varies a little per letter. */
  function tiltFor(id, s) {
    let h = 0; const str = String(id || "x");
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    const mag = 30 + (Math.abs(h) % 12);              // 30..41 deg
    return s < L / 2 ? -mag : mag;                     // CSS: negative = counter-clockwise
  }

  /* ---------- free placement (Nov 19, designer) ----------
     Letters can go anywhere on the photo stage except over the copy block ("Frame 3231").
     A spot is x, y = fractions of the stage, packed into the one `pos` number the backend already stores (0..1):
       pos = (ix * 10000 + iy * 10 + 7) / 1e7, ix / iy = round(x / y * 999); the last digit 7 marks the new format.
     Letters from before Nov 19 have a 4-decimal arch position (last digit 0): they go where that arch point was. */
  const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));
  function encodeXY(x, y) { return (Math.round(clamp01(x) * 999) * 10000 + Math.round(clamp01(y) * 999) * 10 + 7) / 1e7; }
  function decodePos(pos) {
    const k = Math.round(clamp01(pos) * 1e7);
    if (k % 10 === 7) return { x: Math.floor(k / 10000) / 999, y: (Math.floor(k / 10) % 1000) / 999 };
    const p = pointAt(clamp01(pos) * L);                       // old arch letter
    return { x: p.x / A.W, y: p.y / A.H };
  }

  /* Visible part of a letter around its centre, as multiples of the note width w (the 1000 x 900 box is mostly empty):
     envelope + flowers, with room for the ±30-41° tilt. */
  const EXT = { hx: 0.3, top: 0.36, bot: 0.22 };
  function boxAt(cx, cy, w) { return { l: cx - EXT.hx * w, r: cx + EXT.hx * w, t: cy - EXT.top * w, b: cy + EXT.bot * w }; }
  const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

  /* opt: { W, H (stage px), w (note px), block: {l,t,r,b} px or null } */
  function validSpot(cx, cy, placed, opt, allowTouch) {
    const w = opt.w, bx = boxAt(cx, cy, w);
    if (bx.l < 0 || bx.t < 0 || bx.r > opt.W || bx.b > opt.H) return false;
    if (opt.block) { const pad = 0.03 * w, k = opt.block; if (hit(bx, { l: k.l - pad, t: k.t - pad, r: k.r + pad, b: k.b + pad })) return false; }
    if (!allowTouch) for (const p of placed) { const dx = (cx - p.x) / (0.56 * w), dy = (cy - p.y) / (0.5 * w); if (dx * dx + dy * dy < 1) return false; }
    return true;
  }
  /* nearest valid spot to (x, y) px: grow square rings on a grid; once one is found, look a bit further for a closer one */
  function nearestSpot(x, y, placed, opt) {
    const step = Math.max(4, opt.w / 6), maxK = Math.ceil(Math.max(opt.W, opt.H) / step) + 1;
    for (const allowTouch of [false, true]) {               // stage full: letters may overlap, never the copy
      if (validSpot(x, y, placed, opt, allowTouch)) return { x, y };
      let best = null, stopAt = maxK;
      for (let k = 1; k <= stopAt; k++) {
        for (let i = -k; i <= k; i++) for (const [dx, dy] of [[i, -k], [i, k], [-k, i], [k, i]]) {
          if (Math.abs(dy) !== k && Math.abs(dx) !== k) continue;
          const cx = x + dx * step, cy = y + dy * step;
          if (!validSpot(cx, cy, placed, opt, allowTouch)) continue;
          const d = Math.hypot(cx - x, cy - y);
          if (!best || d < best.d) best = { x: cx, y: cy, d };
        }
        if (best && stopAt === maxK) stopAt = Math.min(maxK, Math.ceil(k * 1.42) + 1);
      }
      if (best) return { x: best.x, y: best.y };
    }
    return { x: Math.min(Math.max(x, 0), opt.W), y: Math.min(Math.max(y, 0), opt.H) };
  }
  /* Everyone's letters in time order, each moved as little as needed: deterministic, so guests with the same screen size see the same page. */
  function pack(fracs, opt) {
    const placed = [];
    fracs.forEach((f) => placed.push(nearestSpot(f.x * opt.W, f.y * opt.H, placed, opt)));
    return placed;
  }
  const tiltSide = (id, x) => tiltFor(id, x < 0.5 ? 0 : L);  // left half leans one way, right half the mirror

  window.Notes = { renderNote, renderFlower, FLOWERS, arch: { ...A, L, pointAt, nearestS, layout }, tiltFor,
    free: { encodeXY, decodePos, nearestSpot, pack, validSpot, tiltSide } };
})();
