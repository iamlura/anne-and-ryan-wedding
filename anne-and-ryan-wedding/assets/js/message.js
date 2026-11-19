/* Leave a Message flow: photo page with everyone's letters → write → arrange flowers → place it anywhere → send.
   Since Nov 19 letters go anywhere on the photo except over the copy block (no more arch).
   Secret inbox: tap "Leave a Message" 5 times → password → browse / download every letter. */
(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const MAX_FLOWERS = cfg.MAX_FLOWERS || 4;
  const MAX_MSG = cfg.MAX_MESSAGE || 1500;
  const { renderNote, renderFlower, FLOWERS, free } = window.Notes;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const FONTS = { serif: "var(--serif)", sans: "var(--letter-sans)", script: "var(--script)" };
  const SIZES = { s: 0.8, m: 1, l: 1.25 };
  const DRAFT_KEY = "ar_draft";

  let notes = [];            // public notes on the page
  let draft = loadDraft();   // {from,text,font,size,flowers,xy:{x,y} fractions of the stage or null}

  function loadDraft() {
    try { const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null"); if (d) return d; } catch (e) {}
    return { from: "", text: "", font: "serif", size: "m", flowers: [], xy: null };
  }
  function saveDraft() { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {} }
  function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) {} draft = loadDraft(); }

  /* ---------------- steps ---------------- */
  let current = "home";
  function go(step) {
    current = step;
    $$(".step").forEach((s) => s.classList.toggle("is-active", s.dataset.step === step));
    window.scrollTo(0, 0);
    if (step === "home") drawStage($("#stageHome"), notes);
    if (step === "write") initWrite();
    if (step === "arrange") drawBouquet();
    if (step === "place") initPlace();
  }
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.go === "place") { draft.xy = null; saveDraft(); } // letter waits above the copy until the guest places it
    go(b.dataset.go);
  }));

  /* ---------------- photo stage ---------------- */
  // Figma: letter box 250 wide on the 1920 page (13%), 129 on the 390 phone (33%)
  const isPhone = () => window.matchMedia("(max-width: 760px)").matches;
  function noteWidthPx(stage) { return stage.clientWidth * (isPhone() ? 0.33 : 0.1302); }

  /* the copy block (heading + text + button) in stage px: letters never go over it */
  function blockRect(stage) {
    const copy = stage.parentNode.querySelector(".stage-copy");
    if (!copy) return null;
    const sr = stage.getBoundingClientRect();
    const rs = Array.from(copy.querySelectorAll("h1, h2, p, .btn")).map((el) => el.getBoundingClientRect()).filter((r) => r.width && r.height);
    if (!rs.length) return null;
    return { l: Math.min(...rs.map((r) => r.left)) - sr.left, t: Math.min(...rs.map((r) => r.top)) - sr.top,
             r: Math.max(...rs.map((r) => r.right)) - sr.left, b: Math.max(...rs.map((r) => r.bottom)) - sr.top };
  }
  function stageOpt(stage) { return { W: stage.clientWidth, H: stage.clientHeight, w: noteWidthPx(stage), block: blockRect(stage) }; }

  function placePinPx(pin, p, opt, id) {
    pin.style.left = (p.x / opt.W) * 100 + "%";
    pin.style.top = (p.y / opt.H) * 100 + "%";
    const note = pin.querySelector(".note");
    if (note) note.style.rotate = free.tiltSide(id || pin.dataset.pin || "mine", p.x / opt.W) + "deg"; // mirrored on the right half
  }

  /* notes: [{id,from,flowers,pos,t}] → pins at their spots (packed so none sit on the copy or on each other). Returns the packed px spots. */
  function drawStage(stage, list, opts) {
    opts = opts || {};
    const opt = stageOpt(stage);
    const spots = free.pack(list.map((n) => free.decodePos(n.pos)), opt);
    const keep = new Set();
    list.forEach((n, i) => {
      const id = "p-" + n.id;
      keep.add(id);
      let pin = stage.querySelector('[data-pin="' + id + '"]');
      if (!pin) {
        pin = document.createElement("div");
        pin.className = "pin" + (opts.newId === n.id ? " is-new" : "");
        pin.dataset.pin = id;
        pin.appendChild(renderNote(n));
        pin.title = n.from ? "From " + n.from : "";
        stage.appendChild(pin);
      }
      pin.querySelector(".note").style.setProperty("--w", opt.w + "px");
      placePinPx(pin, spots[i], opt);
    });
    $$(".pin:not(.is-mine)", stage).forEach((p) => { if (!keep.has(p.dataset.pin)) p.remove(); });
    return { spots, opt };
  }

  async function loadNotes(newId) {
    try {
      notes = await WeddingAPI.listNotes();
      notes.sort((a, b) => (a.t || 0) - (b.t || 0));
    } catch (e) {
      toast("Couldn't load the letters right now.");
    }
    if (current === "home") drawStage($("#stageHome"), notes, { newId });
    if (current === "place") relayoutPlace();
  }

  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (current === "home") drawStage($("#stageHome"), notes);
      if (current === "place") relayoutPlace();
      if (current === "arrange" && noteEl) noteEl.style.setProperty("--w", bouquet.clientWidth + "px");
    }, 120);
  });

  /* ---------------- write ---------------- */
  const fromEl = $("#from"), bodyEl = $("#body"), nextEl = $("#writeNext"), errEl = $("#writeErr");
  const fontSel = $("#fontSel"), countEl = $("#count");
  const EMOJI = ["❤️", "💕", "💍", "💐", "🌸", "🌷", "🌹", "🌼", "🥂", "🍾", "🎉", "✨", "🕊️", "💒", "👰", "🤵", "😊", "🥹", "😍", "🥰", "🙏", "🤍", "💜", "🌙"];

  function applyStyle() {
    bodyEl.style.fontFamily = FONTS[draft.font];
    const base = draft.font === "script" ? 1.3 : 1;
    bodyEl.style.fontSize = "calc(var(--fs-input) * " + (SIZES[draft.size] * base) + ")"; // follows the type scale in style.css
    $$("[data-size]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === draft.size)));
    fontSel.value = draft.font;
  }
  function validateWrite() {
    const ok = fromEl.value.trim().length > 0 && bodyEl.value.trim().length > 0;
    nextEl.disabled = !ok;
    countEl.textContent = bodyEl.value.length > MAX_MSG * 0.8 ? bodyEl.value.length + " / " + MAX_MSG : "";
    return ok;
  }
  function initWrite() {
    fromEl.value = draft.from; bodyEl.value = draft.text; bodyEl.maxLength = MAX_MSG;
    applyStyle(); validateWrite(); errEl.textContent = "";
  }
  [fromEl, bodyEl].forEach((el) => el.addEventListener("input", () => {
    draft.from = fromEl.value; draft.text = bodyEl.value; validateWrite(); errEl.textContent = ""; saveDraft();
  }));
  fontSel.addEventListener("change", () => { draft.font = fontSel.value; applyStyle(); saveDraft(); });
  $$("[data-size]").forEach((b) => b.addEventListener("click", () => { draft.size = b.dataset.size; applyStyle(); saveDraft(); }));

  const pop = $("#emojiPop"), emojiBtn = $("#emojiBtn");
  EMOJI.forEach((e) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = e; b.setAttribute("aria-label", "Insert " + e);
    b.addEventListener("click", () => {
      const st = bodyEl.selectionStart ?? bodyEl.value.length, en = bodyEl.selectionEnd ?? st;
      bodyEl.setRangeText(e, st, en, "end"); bodyEl.focus();
      bodyEl.dispatchEvent(new Event("input"));
    });
    pop.appendChild(b);
  });
  emojiBtn.addEventListener("click", () => {
    const open = !pop.classList.contains("open");
    pop.classList.toggle("open", open); emojiBtn.setAttribute("aria-expanded", String(open));
  });

  nextEl.addEventListener("click", () => {
    if (!validateWrite()) return;
    if (ContentFilter.hasBadWords(fromEl.value) || ContentFilter.hasBadWords(bodyEl.value)) {
      errEl.textContent = "Some words in your message aren't allowed here. Please keep it kind for Anne and Ryan.";
      return;
    }
    draft.from = fromEl.value.trim(); draft.text = bodyEl.value.trim(); saveDraft();
    go("arrange");
  });

  /* ---------------- arrange (drag & drop flowers) ---------------- */
  const bouquet = $("#bouquet"), palette = $("#palette"), hint = $("#arrangeHint");
  let noteEl = null;
  const GHOST = [{ f: 1, x: 0.4, y: 0.6, r: -24 }, { f: 3, x: 0.5, y: 0.56, r: 2 }, { f: 2, x: 0.6, y: 0.6, r: 22 }];

  function drawBouquet() {
    bouquet.innerHTML = "";
    const show = draft.flowers.length ? draft.flowers : [];
    noteEl = renderNote({ from: draft.from, flowers: show });
    if (!draft.flowers.length) {
      GHOST.forEach((g) => { const d = renderFlower(g, -1); d.classList.add("ghost"); noteEl.insertBefore(d, noteEl.querySelector(".env")); });
    }
    $$(".fl:not(.ghost)", noteEl).forEach((d) => {
      const x = document.createElement("button");
      x.className = "x"; x.type = "button"; x.innerHTML = "&times;"; x.setAttribute("aria-label", "Remove flower");
      x.addEventListener("pointerdown", (e) => e.stopPropagation());
      x.addEventListener("click", (e) => { e.stopPropagation(); removeFlower(+d.dataset.i); });
      d.appendChild(x);
      d.addEventListener("pointerdown", (e) => startDrag(e, { from: "bouquet", i: +d.dataset.i, f: draft.flowers[+d.dataset.i].f }));
    });
    bouquet.appendChild(noteEl);
    noteEl.style.setProperty("--w", bouquet.clientWidth + "px");
    const full = draft.flowers.length >= MAX_FLOWERS;
    palette.classList.toggle("is-full", full);
    hint.textContent = full ? "That's 4 flowers, the max. Remove one to swap it out." : "Up to 4 flowers. Drag one off the envelope to remove it.";
  }

  function removeFlower(i) { draft.flowers.splice(i, 1); saveDraft(); drawBouquet(); }

  // clamp so stems tuck behind the envelope
  function toFlower(f, clientX, clientY) {
    const r = bouquet.getBoundingClientRect();
    const meta = FLOWERS[f];
    const hFrac = meta.h; // of box height
    let x = (clientX - r.left) / r.width;
    let y = (clientY - r.top) / r.height + hFrac / 2;     // pointer holds flower centre; store bottom
    x = Math.max(0.3, Math.min(0.7, x));
    y = Math.max(0.52, Math.min(0.64, y));
    const rot = Math.round((x - 0.5) * 90);
    return { f, x: +x.toFixed(3), y: +y.toFixed(3), r: rot };
  }

  let drag = null;
  function startDrag(e, src) {
    if (src.from === "palette" && draft.flowers.length >= MAX_FLOWERS) { toast("You can add up to 4 flowers."); return; }
    e.preventDefault();
    const r = bouquet.getBoundingClientRect();
    const meta = FLOWERS[src.f];
    const h = r.height * meta.h, w = h * meta.aspect;
    const g = document.createElement("div");
    g.className = "drag-ghost"; g.style.width = w + "px"; g.style.height = h + "px";
    g.innerHTML = '<img src="' + meta.src + '" alt="">';
    document.body.appendChild(g);
    drag = { src, g, moved: false, x0: e.clientX, y0: e.clientY };
    if (src.from === "bouquet") {
      const el = noteEl.querySelector('.fl[data-i="' + src.i + '"]');
      if (el) el.style.visibility = "hidden";
    }
    moveGhost(e);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onCancel, { once: true });
  }
  function overBouquet(e) {
    const r = bouquet.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  function moveGhost(e) {
    drag.g.style.left = e.clientX + "px"; drag.g.style.top = e.clientY + "px";
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    bouquet.classList.toggle("drop-ok", overBouquet(e));
  }
  function onMove(e) { if (drag) moveGhost(e); }
  function endDrag() { window.removeEventListener("pointermove", onMove); bouquet.classList.remove("drop-ok"); if (drag) drag.g.remove(); drag = null; }
  function onCancel() { endDrag(); drawBouquet(); }
  function onUp(e) {
    if (!drag) return;
    const { src, moved } = drag;
    const inside = overBouquet(e);
    if (src.from === "palette") {
      if (inside) draft.flowers.push(toFlower(src.f, e.clientX, e.clientY));
      else if (!moved) { // tap on a palette flower = drop it in a free spot
        const slots = [0.38, 0.62, 0.5, 0.44, 0.56];
        const x = slots[draft.flowers.length % slots.length];
        const r = bouquet.getBoundingClientRect();
        draft.flowers.push(toFlower(src.f, r.left + x * r.width, r.top + r.height * 0.22));
      }
    } else {
      if (!moved) { // tap = select (shows the delete button on touch screens)
        endDrag(); drawBouquet();
        const el = noteEl.querySelector('.fl[data-i="' + src.i + '"]');
        if (el) el.classList.add("sel");
        return;
      }
      if (inside) draft.flowers[src.i] = toFlower(src.f, e.clientX, e.clientY);
      else draft.flowers.splice(src.i, 1);
    }
    saveDraft(); endDrag(); drawBouquet();
  }
  $$(".slot", palette).forEach((s) => {
    s.addEventListener("pointerdown", (e) => startDrag(e, { from: "palette", f: +s.dataset.flower }));
    s.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (draft.flowers.length >= MAX_FLOWERS) { toast("You can add up to 4 flowers."); return; }
      const r = bouquet.getBoundingClientRect();
      const x = [0.38, 0.62, 0.5, 0.44][draft.flowers.length % 4];
      draft.flowers.push(toFlower(+s.dataset.flower, r.left + x * r.width, r.top + r.height * 0.22));
      saveDraft(); drawBouquet();
    });
  });

  /* ---------------- place it anywhere ---------------- */
  const stageP = $("#stagePlace"), sendBtn = $("#sendBtn");
  let myPin = null, others = [];

  function initPlace() {
    $$(".pin", stageP).forEach((p) => p.remove());
    myPin = document.createElement("div");
    myPin.className = "pin is-mine";
    myPin.tabIndex = 0;
    myPin.setAttribute("role", "button");
    myPin.setAttribute("aria-label", "Your letter. Drag it anywhere on the photo (not over the text), or use the arrow keys to move it.");
    myPin.appendChild(renderNote({ from: draft.from, flowers: draft.flowers }));
    stageP.appendChild(myPin);
    relayoutPlace();
    myPin.addEventListener("pointerdown", pinDown);
    myPin.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return;
      e.preventDefault();
      const opt = stageOpt(stageP), cur = currentPx(opt), k = opt.w * 0.25;
      moveTo(cur.x + d[0] * k, cur.y + d[1] * k, opt, d);
    });
  }

  /* others first (fixed), then mine on top */
  function relayoutPlace() {
    if (!myPin) return;
    const r = drawStage(stageP, notes);
    others = r.spots;
    const opt = r.opt;
    myPin.querySelector(".note").style.setProperty("--w", opt.w + "px");
    sendBtn.disabled = !draft.xy;                       // 50% until the guest has placed it
    const p = draft.xy ? free.nearestSpot(draft.xy.x * opt.W, draft.xy.y * opt.H, others, opt) : homeSpot(opt);
    placePinPx(myPin, p, opt, "mine");
    if (!draft.xy) myPin.querySelector(".note").style.rotate = "-41deg"; // same tilt as the Figma envelope
    myPin.classList.remove("is-bad");
  }
  /* before it's placed, the letter waits just above the copy, in the middle */
  function homeSpot(opt) {
    const y = opt.block ? opt.block.t - opt.w * 0.32 : opt.H * 0.25;
    return free.nearestSpot(opt.W / 2, y, others, opt);
  }
  function currentPx(opt) {
    return { x: (parseFloat(myPin.style.left) / 100) * opt.W, y: (parseFloat(myPin.style.top) / 100) * opt.H };
  }
  /* snap to the nearest free spot (never over the copy); dir = keyboard direction, so a key press always moves it */
  function moveTo(x, y, opt, dir) {
    let p = free.nearestSpot(x, y, others, opt);
    if (dir && Math.abs(p.x - x) + Math.abs(p.y - y) > opt.w * 0.2) { // blocked: jump past the obstacle in that direction
      for (let k = 2; k < 40; k++) {
        const q = free.nearestSpot(x + dir[0] * opt.w * 0.25 * k, y + dir[1] * opt.w * 0.25 * k, others, opt);
        if (Math.sign(q.x - x) === dir[0] || Math.sign(q.y - y) === dir[1]) { p = q; break; }
      }
    }
    draft.xy = { x: +(p.x / opt.W).toFixed(4), y: +(p.y / opt.H).toFixed(4) };
    saveDraft();
    placePinPx(myPin, p, opt, "mine");
    sendBtn.disabled = false;
  }

  function stagePx(e) {
    const r = stageP.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function pinDown(e) {
    e.preventDefault();
    myPin.setPointerCapture(e.pointerId);
    myPin.classList.add("dragging");
    const opt = stageOpt(stageP), cur = currentPx(opt), p0 = stagePx(e);
    const off = { x: cur.x - p0.x, y: cur.y - p0.y };      // keep the grab point under the finger
    const move = (ev) => {
      const p = stagePx(ev), x = p.x + off.x, y = p.y + off.y;
      myPin.style.left = (x / opt.W) * 100 + "%";
      myPin.style.top = (y / opt.H) * 100 + "%";
      myPin.querySelector(".note").style.rotate = free.tiltSide("mine", x / opt.W) + "deg";
      myPin.classList.toggle("is-bad", !free.validSpot(x, y, others, opt, true)); // over the text: shown faded
    };
    const up = (ev) => {
      myPin.removeEventListener("pointermove", move);
      myPin.classList.remove("dragging", "is-bad");
      const p = stagePx(ev);
      moveTo(p.x + off.x, p.y + off.y, opt);               // snaps to the nearest free spot
    };
    myPin.addEventListener("pointermove", move);
    myPin.addEventListener("pointerup", up, { once: true });
    myPin.addEventListener("pointercancel", up, { once: true });
  }
  /* tap anywhere on the photo: the letter goes there */
  stageP.addEventListener("click", (e) => {
    if (!myPin || e.target.closest(".pin.is-mine")) return;
    const opt = stageOpt(stageP), p = stagePx(e);
    moveTo(p.x, p.y + opt.w * 0.07, opt);
  });

  sendBtn.addEventListener("click", async () => {
    if (!draft.from || !draft.text) { go("write"); return; }
    if (!draft.xy) return;
    sendBtn.disabled = true; sendBtn.textContent = "Sending…";
    try {
      const res = await WeddingAPI.sendMessage({
        from: draft.from, text: draft.text, font: draft.font, size: draft.size,
        flowers: draft.flowers, pos: free.encodeXY(draft.xy.x, draft.xy.y)
      });
      clearDraft();
      go("home");
      await loadNotes(res.id);
      toast("Your letter is up for Anne and Ryan. Thank you!", 4500);
    } catch (err) {
      toast(err && /allowed/i.test(err.message) ? err.message : "Couldn't send your letter. Please try again.");
    } finally {
      sendBtn.disabled = !draft.xy; sendBtn.textContent = "Send Message";
    }
  });

  /* ---------------- secret inbox ---------------- */
  let taps = 0, tapT;
  $$("[data-secret-tap]").forEach((el) => el.addEventListener("click", (e) => {
    if (el.tagName === "A") { e.preventDefault(); if (current !== "home") { go("home"); return; } }
    taps++; clearTimeout(tapT); tapT = setTimeout(() => (taps = 0), 4000);
    if (taps >= 5) { taps = 0; openPw(); }
  }));

  const pwModal = $("#pwModal"), pwInput = $("#pw"), pwErr = $("#pwErr");
  function openPw() { pwModal.classList.add("open"); pwErr.textContent = ""; pwInput.value = ""; setTimeout(() => pwInput.focus(), 50); }
  function closePw() { pwModal.classList.remove("open"); }
  $("#pwCancel").addEventListener("click", closePw);
  pwModal.addEventListener("click", (e) => { if (e.target === pwModal) closePw(); });
  $("#pwForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    pwErr.textContent = "";
    try {
      const res = await WeddingAPI.openInbox(pwInput.value);
      closePw();
      openInbox(res.messages || []);
    } catch (err) {
      pwErr.textContent = "That's not it.";
      const box = $("#pwForm"); box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
    }
  });

  const inbox = $("#inbox"), viewer = $("#viewer"), counter = $("#counter");
  let letters = [], idx = 0;

  function openInbox(list) {
    letters = list.slice().sort((a, b) => (a.t || 0) - (b.t || 0));
    idx = 0; inbox.classList.add("open"); document.body.style.overflow = "hidden";
    showLetter();
  }
  function closeInbox() { inbox.classList.remove("open"); document.body.style.overflow = ""; }

  function letterEl(m) {
    const d = document.createElement("div");
    d.className = "letter";
    d.style.fontFamily = FONTS[m.font] || FONTS.serif;
    const base = m.font === "script" ? 1.3 : 1;
    d.style.fontSize = "calc(var(--fs-body) * " + (SIZES[m.size] || 1) * base + ")";
    d.textContent = m.text || "";
    const sig = document.createElement("p"); sig.className = "sig"; sig.textContent = m.from || "";
    d.appendChild(sig);
    return d;
  }

  function showLetter() {
    viewer.innerHTML = ""; viewer.classList.remove("is-open");
    if (!letters.length) {
      viewer.innerHTML = '<p class="inbox__empty">No letters yet. Check back soon!</p>';
      counter.textContent = "0/0"; return;
    }
    const m = letters[idx];
    const n = renderNote(m);
    n.setAttribute("role", "button"); n.tabIndex = 0; n.setAttribute("aria-label", "Open letter from " + (m.from || "a guest"));
    const open = () => viewer.classList.add("is-open");
    n.addEventListener("click", open);
    n.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    viewer.appendChild(n);
    viewer.appendChild(letterEl(m));
    counter.textContent = idx + 1 + "/" + letters.length;
    $("#inPrev").disabled = letters.length < 2; $("#inNext").disabled = letters.length < 2;
  }
  const step = (d) => { if (!letters.length) return; idx = (idx + d + letters.length) % letters.length; showLetter(); };
  $("#inPrev").addEventListener("click", () => step(-1));
  $("#inNext").addEventListener("click", () => step(1));
  $("#inNextMsg").addEventListener("click", () => step(1));
  $("#inClose").addEventListener("click", closeInbox);
  document.addEventListener("keydown", (e) => {
    if (!inbox.classList.contains("open")) return;
    if (e.key === "Escape") closeInbox();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  /* ---------------- PDF download ---------------- */
  const CDN = {
    jspdf: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    h2c: "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  };
  const loadScript = (src) => new Promise((res, rej) => {
    if ($('script[src="' + src + '"]')) return res();
    const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });

  async function makePdf(list, filename) {
    if (!list.length) return;
    toast("Preparing your PDF…", 6000);
    try {
      await Promise.all([loadScript(CDN.jspdf), loadScript(CDN.h2c)]);
      await document.fonts.ready;
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
      for (let i = 0; i < list.length; i++) {
        const m = list[i];
        const sheet = document.createElement("div");
        sheet.className = "pdf-sheet";
        const head = document.createElement("p"); head.className = "pdf-head"; head.textContent = "For Anne & Ryan";
        const n = renderNote(m, "300px"); n.classList.add("pdf-note");
        const body = document.createElement("div");
        body.style.fontFamily = FONTS[m.font] || FONTS.serif;
        body.style.fontSize = (m.font === "script" ? 26 : 18) * (SIZES[m.size] || 1) + "px";
        body.textContent = m.text || "";
        const sig = document.createElement("p"); sig.style.marginTop = "24px"; sig.textContent = m.from || "";
        body.appendChild(sig);
        const date = document.createElement("p"); date.style.cssText = "margin-top:30px;font-size:12px;opacity:.5;font-family:var(--sans)";
        date.textContent = m.t > 1e12 ? new Date(m.t).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
        sheet.append(head, n, body, date);
        document.body.appendChild(sheet);
        const canvas = await window.html2canvas(sheet, { scale: 2, backgroundColor: "#ffffff" });
        sheet.remove();
        const img = canvas.toDataURL("image/jpeg", 0.92);
        const h = (canvas.height / canvas.width) * pw;
        if (i > 0) pdf.addPage();
        if (h <= ph) pdf.addImage(img, "JPEG", 0, 0, pw, h);
        else { // long letter: slice over several pages
          let y = 0;
          while (y < h) { if (y > 0) pdf.addPage(); pdf.addImage(img, "JPEG", 0, -y, pw, h); y += ph; }
        }
      }
      pdf.save(filename);
      toast("Downloaded " + filename);
    } catch (e) {
      toast("Couldn't make the PDF. Check your connection and try again.");
    }
  }
  const slug = (s) => String(s || "guest").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "guest";
  $("#dlOne").addEventListener("click", () => letters[idx] && makePdf([letters[idx]], "note-from-" + slug(letters[idx].from) + ".pdf"));
  $("#dlAll").addEventListener("click", () => makePdf(letters, "anne-and-ryan-notes.pdf"));

  /* ---------------- boot ---------------- */
  go("home");
  loadNotes();
})();
