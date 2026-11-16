// DOM -> layout JSON for rebuilding a page as editable Figma layers.
// Run in the page after it has settled. Returns {w,h,bg,c:[...nodes]}.
(() => {
  const PW = document.documentElement.clientWidth;
  // 1. freeze motion, make pseudo-elements real, take rotation out (kept as data)
  const st = document.createElement('style');
  st.textContent = '*{transition:none!important;animation:none!important}.__np::before,.__np::after{content:none!important}';
  document.head.appendChild(st);
  document.querySelectorAll('[data-fade]').forEach(e => e.classList.add('in'));
  const all = [...document.body.querySelectorAll('*')];
  for (const el of all) {
    if (['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BR', 'SCRIPT', 'STYLE'].includes(el.tagName)) continue;
    const made = [];
    for (const ps of ['::before', '::after']) {
      const cs = getComputedStyle(el, ps);
      if (!cs.content || cs.content === 'none' || cs.content === 'normal') continue;
      const sp = document.createElement('span');
      for (const p of cs) { try { sp.style.setProperty(p, cs.getPropertyValue(p)); } catch (e) {} }
      sp.style.content = 'normal';
      const m = cs.content.match(/^"(.*)"$/);
      sp.textContent = m ? m[1] : '';
      made.push([ps, sp]);
    }
    if (made.length) {
      el.classList.add('__np');
      for (const [ps, sp] of made) ps === '::before' ? el.prepend(sp) : el.append(sp);
    }
  }
  const rot = new Map();
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    let ang = 0;
    if (cs.rotate && cs.rotate !== 'none') { const m = cs.rotate.match(/(-?[\d.]+)deg/); if (m) ang += parseFloat(m[1]); }
    if (cs.transform && cs.transform !== 'none') {
      const m = cs.transform.match(/matrix\(([^)]+)\)/);
      if (m) {
        const [a, b, c, d, e, f] = m[1].split(',').map(Number);
        const t = Math.atan2(b, a) * 180 / Math.PI;
        if (Math.abs(t) > 0.01) { ang += t; el.style.transform = `translate(${e}px,${f}px)`; }
      }
    }
    if (Math.abs(ang) > 0.01) { rot.set(el, ang); el.style.rotate = 'none'; }
  }
  window.scrollTo(0, 0);
  const SY = window.scrollY;
  // helpers
  const col = s => {
    if (!s) return null; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    return [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1].map(v => +v.toFixed(4));
  };
  const R = el => { const r = el.getBoundingClientRect(); return [r.left, r.top + SY, r.width, r.height].map(v => +v.toFixed(2)); };
  const px = v => parseFloat(v) || 0;
  const rad = (v, w) => { const f = (v || '0').split(' ')[0]; return f.endsWith('%') ? w * parseFloat(f) / 100 : px(f); };
  const url = s => { const m = (s || '').match(/url\("?([^")]+)"?\)/); return m ? m[1] : null; };
  const fontOf = cs => {
    const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const w = parseInt(cs.fontWeight) || 400, it = cs.fontStyle === 'italic';
    const nm = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
    const wn = nm[Math.min(700, Math.max(300, Math.round(w / 100) * 100))];
    if (fam === 'Pinyon Script') return ['Pinyon Script', 'Regular'];
    if (fam === 'Cormorant SC') return ['Cormorant SC', wn];
    if (fam === 'Cormorant Garamond' || fam === 'Cormorant') return [fam, it ? (wn === 'Regular' ? 'Italic' : wn + ' Italic') : wn];
    return ['Inter', it ? 'Italic' : (wn === 'SemiBold' ? 'Semi Bold' : wn)];
  };
  const styles = [], sidx = new Map();
  const styleOf = cs => {
    const f = fontOf(cs);
    const s = { f: f[0], s: f[1], z: px(cs.fontSize), c: col(cs.color), ls: cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing),
      tt: cs.textTransform, td: (cs.textDecorationLine || '').includes('underline') ? 'U' : '' };
    const k = JSON.stringify(s); if (!sidx.has(k)) { sidx.set(k, styles.length); styles.push(s); } return sidx.get(k);
  };
  const visual = cs => {
    const bg = col(cs.backgroundColor);
    const bws = ['Top', 'Right', 'Bottom', 'Left'].map(s => cs['border' + s + 'Style'] !== 'none' ? px(cs['border' + s + 'Width']) : 0);
    const bc = col(cs.borderTopColor) || col(cs.borderBottomColor);
    return (bg && bg[3] > 0) || url(cs.backgroundImage) || (bws.some(v => v > 0) && bc && bc[3] > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
  };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'META', 'LINK']);
  const shadow = s => {
    if (!s || s === 'none') return null;
    const c = s.match(/rgba?\([^)]+\)/); const rest = s.replace(/rgba?\([^)]+\)/, '').trim().split(/\s+/).map(px);
    return [rest[0] || 0, rest[1] || 0, rest[2] || 0, rest[3] || 0, col(c ? c[0] : 'rgba(0,0,0,.2)')];
  };
  const images = [];
  const box = (el, cs) => {
    const r = R(el);
    const n = { t: 'b', r, c: [] };
    const bg = col(cs.backgroundColor); if (bg && bg[3] > 0) n.bg = bg;
    const bi = url(cs.backgroundImage);
    if (bi) { n.img = images.length; images.push({ src: bi, fit: cs.backgroundSize, pos: cs.backgroundPosition, w: r[2], h: r[3] }); }
    const bws = ['Top', 'Right', 'Bottom', 'Left'].map(s => cs['border' + s + 'Style'] !== 'none' ? px(cs['border' + s + 'Width']) : 0);
    if (bws.some(v => v > 0)) { n.bw = bws; n.bc = col(cs.borderTopWidth !== '0px' ? cs.borderTopColor : (bws[2] ? cs.borderBottomColor : cs.borderLeftColor)); }
    const br = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(v => Math.min(rad(v, r[2]), r[2] / 2, r[3] / 2));
    if (br.some(v => v > 0)) n.br = br.map(v => +v.toFixed(2));
    const sh = shadow(cs.boxShadow); if (sh) n.sh = sh;
    const op = px(cs.opacity); if (op < 1) n.op = op;
    if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') n.clip = 1;
    if (rot.has(el)) n.rot = +rot.get(el).toFixed(3);
    const zi = parseInt(cs.zIndex); if (cs.position !== 'static' && !isNaN(zi)) n.z = zi; else if (/fixed|sticky/.test(cs.position)) n.z = 1;
    return n;
  };
  const isInlineEl = (el, cs) => cs.display === 'inline' && !['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'svg'].includes(el.tagName) && !visual(cs);
  const textNode = (container, ccs, runs, tnodes, flexish, tacc) => {
    // normalise whitespace across runs
    const pre = /pre/.test(ccs.whiteSpace);
    let out = [], prevSp = true;
    for (let [t, s] of runs) {
      if (t === '\u0000') { if (out.length) { const l = out[out.length - 1]; l[0] = l[0].replace(/ +$/, ''); } out.push(['\n', s]); prevSp = true; continue; }
      if (!pre) { t = t.replace(/\s+/g, ' '); if (prevSp) t = t.replace(/^ /, ''); }
      if (!t) continue; out.push([t, s]); prevSp = /[ \n]$/.test(t);
    }
    while (out.length && !pre) { const l = out[out.length - 1]; l[0] = l[0].replace(/[ ]+$/, ''); if (l[0]) break; out.pop(); }
    if (!out.length) return null;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const tn of tnodes) { const rg = document.createRange(); rg.selectNodeContents(tn); for (const q of rg.getClientRects()) { if (q.width < 0.5) continue; x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); } }
    if (x0 > x1) return null;
    const al = { left: 'LEFT', start: 'LEFT', center: 'CENTER', right: 'RIGHT', end: 'RIGHT', justify: 'JUSTIFIED' }[ccs.textAlign] || 'LEFT';
    let x, w;
    if (flexish) { x = x0 - 2; w = x1 - x0 + 4; }
    else { const cr = container.getBoundingClientRect(); x = cr.left + px(ccs.borderLeftWidth) + px(ccs.paddingLeft); w = container.clientWidth - px(ccs.paddingLeft) - px(ccs.paddingRight); if (w <= 0) { x = x0 - 2; w = x1 - x0 + 4; } }
    w += 3; if (al === 'CENTER') x -= 1.5; else if (al === 'RIGHT') x -= 3;
    const lh = ccs.lineHeight === 'normal' ? 0 : px(ccs.lineHeight);
    const o = { t: 'x', r: [+x.toFixed(2), +(y0 + SY).toFixed(2), +w.toFixed(2), +(y1 - y0).toFixed(2)], runs: out, al, lh };
    if (tacc < 0.999) o.op = +tacc.toFixed(3);
    return o;
  };
  const walk = (el, parent, depth, acc = 1) => {
    if (SKIP.has(el.tagName)) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || px(cs.opacity) === 0) return;
    const r = R(el);
    if (!parent.clip && (r[0] + r[2] < -20 || r[0] > PW + 20) && cs.position !== 'static') return;
    const tag = el.tagName;
    if (tag === 'IMG') {
      if (r[2] < 1 || r[3] < 1) return;
      const src = el.currentSrc || el.src;
      const n = { t: src.endsWith('.svg') ? 's' : 'i', r, src: new URL(src).pathname };
      const br = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(v => Math.min(rad(v, r[2]), r[2] / 2, r[3] / 2));
      if (br.some(v => v > 0)) n.br = br.map(v => +v.toFixed(2));
      const op = px(cs.opacity) * acc; if (op < 0.999) n.op = +op.toFixed(3);
      if (rot.has(el)) n.rot = +rot.get(el).toFixed(3);
      { const zi = parseInt(cs.zIndex); if (cs.position !== 'static' && !isNaN(zi)) n.z = zi; }
      if (n.t === 'i') { n.img = images.length; images.push({ src: n.src, fit: cs.objectFit, pos: cs.objectPosition, w: r[2], h: r[3] }); }
      parent.c.push(n); return;
    }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
      if (el.type === 'hidden' || r[2] < 2) return;
      const n = box(el, cs); if (acc < 0.999) n.op = +((n.op || 1) * acc).toFixed(3); parent.c.push(n);
      const val = el.value || el.placeholder || '';
      if (val) {
        const pcs = el.value ? cs : getComputedStyle(el, '::placeholder');
        const s = styleOf(pcs);
        const x = r[0] + px(cs.borderLeftWidth) + px(cs.paddingLeft), w = r[2] - px(cs.borderLeftWidth) - px(cs.borderRightWidth) - px(cs.paddingLeft) - px(cs.paddingRight);
        const lh = cs.lineHeight === 'normal' ? px(cs.fontSize) * 1.25 : px(cs.lineHeight);
        const y = tag === 'TEXTAREA' ? r[1] + px(cs.borderTopWidth) + px(cs.paddingTop) : r[1] + r[3] / 2 - lh / 2;
        const al = { center: 'CENTER', right: 'RIGHT' }[cs.textAlign] || 'LEFT';
        n.c.push({ t: 'x', r: [x, y, w + 3, lh], runs: [[val, s]], al, lh: tag === 'TEXTAREA' ? lh : lh });
      }
      return;
    }
    const forced = depth <= 1 || ['SECTION', 'HEADER', 'FOOTER', 'NAV', 'FORM', 'FIGURE', 'MAIN', 'ARTICLE'].includes(tag);
    const make = forced || visual(cs) || rot.has(el) || ((cs.overflow !== 'visible') && r[2] > 0);
    const me = make ? box(el, cs) : parent;
    if (make && acc < 0.999) me.op = +((me.op || 1) * acc).toFixed(3);
    if (make) parent.c.push(me);
    const tacc = make ? 1 : acc * px(cs.opacity);
    const flexish = /flex|grid/.test(cs.display) || cs.display === 'inline';
    let runs = [], tnodes = [];
    const flush = () => { if (runs.length) { const t = textNode(el, cs, runs, tnodes, flexish, tacc); if (t) me.c.push(t); } runs = []; tnodes = []; };
    const inl = (node, s) => {
      for (const ch of node.childNodes) {
        if (ch.nodeType === 3) { if (ch.textContent) { runs.push([ch.textContent, s]); tnodes.push(ch); } }
        else if (ch.nodeType === 1) {
          const ccs = getComputedStyle(ch);
          if (ccs.display === 'none') continue;
          if (ch.tagName === 'BR') { runs.push(['\u0000', s]); continue; }
          if (isInlineEl(ch, ccs)) inl(ch, styleOf(ccs));
          else { flush(); walk(ch, me, depth + 1, tacc); }
        }
      }
    };
    inl(el, styleOf(cs));
    flush();
  };
  const root = { t: 'b', r: [0, 0, PW, document.documentElement.scrollHeight], c: [], clip: 1 };
  const bcs = getComputedStyle(document.body), hcs = getComputedStyle(document.documentElement);
  const bg = col(bcs.backgroundColor); root.bg = bg && bg[3] > 0 ? bg : col(hcs.backgroundColor);
  for (const ch of document.body.children) walk(ch, root, 1);
  const sortZ = n => { if (!n.c) return; n.c = n.c.map((k, i) => [k, i]).sort((a, b) => ((a[0].z || 0) - (b[0].z || 0)) || (a[1] - b[1])).map(a => a[0]); n.c.forEach(sortZ); };
  sortZ(root);
  return { root, styles, images };
})()
