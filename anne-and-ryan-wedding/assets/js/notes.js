/* Notes: envelope + bouquet rendering, and the flower-arch path used for snapping.
   All arch math is in Figma units of the 1920 x 1652 arch artwork. */
(function () {
  const FLOWERS = {
    1: { src: "assets/img/flower-1.png", aspect: 204 / 618, h: 0.56 },
    2: { src: "assets/img/flower-2.png", aspect: 203 / 618, h: 0.56 },
    3: { src: "assets/img/flower-3.png", aspect: 252 / 661, h: 0.6 }
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

  function tiltFor(id) {
    let h = 0; const s = String(id || "x");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return ((Math.abs(h) % 61) - 30); // -30..30 deg
  }

  window.Notes = { renderNote, renderFlower, FLOWERS, arch: { ...A, L, pointAt, nearestS, layout }, tiltFor };
})();
