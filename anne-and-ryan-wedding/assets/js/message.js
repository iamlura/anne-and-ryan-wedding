/* Leave a Message flow: arch → write → arrange flowers → place on arch → send.
   Secret inbox: tap "Leave a Message" 5 times → password → browse / download every letter. */
(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const MAX_FLOWERS = cfg.MAX_FLOWERS || 4;
  const MAX_MSG = cfg.MAX_MESSAGE || 1500;
  const { renderNote, renderFlower, FLOWERS, arch, tiltFor } = window.Notes;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const FONTS = { serif: "var(--serif)", sans: "var(--sans)", script: "var(--script)" };
  const SIZES = { s: 0.8, m: 1, l: 1.25 };
  const DRAFT_KEY = "ar_draft";

  let notes = [];            // public notes on the arch
  let draft = loadDraft();   // {from,text,font,size,flowers,s}

  function loadDraft() {
    try { const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null"); if (d) return d; } catch (e) {}
    return { from: "", text: "", font: "serif", size: "m", flowers: [], s: null };
  }
  function saveDraft() { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {} }
  function clearDraft() { try { sessionStorage.removeItem(DRAFT_KEY); } catch (e) {} draft = loadDraft(); }

  /* ---------------- steps ---------------- */
  let current = "home";
  function go(step) {
    current = step;
    $$(".step").forEach((s) => s.classList.toggle("is-active", s.dataset.step === step));
    window.scrollTo(0, 0);
    if (step === "home") drawStage($("#stageHome"), notes, null);
    if (step === "write") initWrite();
    if (step === "arrange") drawBouquet();
    if (step === "place") initPlace();
  }
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.go === "place") { draft.s = null; saveDraft(); } // letter starts in the middle, not on the arch
    go(b.dataset.go);
  }));

  /* ---------------- arch stage ---------------- */
  function noteWidthPx(stage) { return Math.max(72, stage.clientWidth * 0.133); }

  function placePin(pin, s) {
    const p = arch.pointAt(s);
    pin.style.left = (p.x / arch.W) * 100 + "%";
    pin.style.top = (p.y / arch.H) * 100 + "%";
    const note = pin.querySelector(".note");
    if (note) note.style.rotate = tiltFor(pin.dataset.pin || "mine", s) + "deg"; // mirrored on the right half
  }

  /* notes: [{id,from,flowers,pos(0..1),t}], mine: {s} or null */
  function drawStage(stage, list, mine, opts) {
    opts = opts || {};
    const w = noteWidthPx(stage);
    const gap = (w / stage.clientWidth) * arch.W * 0.72;
    const items = list.map((n) => ({ s: (Number(n.pos) || 0) * arch.L, k: n.t || 0 }));
    if (mine) items.push({ s: mine.s, k: Number.MAX_SAFE_INTEGER });
    const pos = arch.layout(items, gap);

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
      pin.querySelector(".note").style.setProperty("--w", w + "px");
      placePin(pin, pos[i]);
    });
    $$(".pin:not(.is-mine)", stage).forEach((p) => { if (!keep.has(p.dataset.pin)) p.remove(); });
    return mine ? pos[pos.length - 1] : null;
  }

  async function loadNotes(newId) {
    try {
      notes = await WeddingAPI.listNotes();
      notes.sort((a, b) => (a.t || 0) - (b.t || 0));
    } catch (e) {
      toast("Couldn't load the letters right now.");
    }
    if (current === "home") drawStage($("#stageHome"), notes, null, { newId });
  }

  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (current === "home") drawStage($("#stageHome"), notes, null);
      if (current === "place") relayoutPlace(false);
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

  /* ---------------- place on the arch ---------------- */
  const stageP = $("#stagePlace"), sendBtn = $("#sendBtn");
  let myPin = null;

  function initPlace() {
    $$(".pin", stageP).forEach((p) => p.remove());
    myPin = document.createElement("div");
    myPin.className = "pin is-mine";
    myPin.tabIndex = 0;
    myPin.setAttribute("role", "slider");
    myPin.setAttribute("aria-label", "Your letter. Drag it onto the arch, or use arrow keys to move it along the arch.");
    const n = renderNote({ from: draft.from, flowers: draft.flowers });
    myPin.appendChild(n);
    stageP.appendChild(myPin);
    relayoutPlace(false);
    myPin.addEventListener("pointerdown", pinDown);
    myPin.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: -60, ArrowDown: -60, ArrowRight: 60, ArrowUp: 60 }[e.key];
      if (!d) return;
      e.preventDefault();
      const from = draft.s == null ? arch.L / 2 - d : draft.s;   // first key press puts it at the top of the arch
      draft.s = Math.max(0, Math.min(arch.L, from + d)); relayoutPlace(false); saveDraft();
    });
  }

  function relayoutPlace(dragging, liveS) {
    const s = liveS != null ? liveS : draft.s;
    myPin.querySelector(".note").style.setProperty("--w", noteWidthPx(stageP) + "px");
    sendBtn.disabled = s == null && !dragging;          // 50% until the letter is on the arch
    if (s == null) { drawStage(stageP, notes, null); placeHome(); return null; }
    const resolved = drawStage(stageP, notes, { s });
    if (!dragging) { draft.s = resolved; placePin(myPin, resolved); }
    return resolved;
  }

  /* Before it's placed, the letter waits in the middle: just above "Place your letter" on desktop,
     in the centre of the arch on phones (where the heading sits above the arch). */
  function placeHome() {
    const r = stageP.getBoundingClientRect(), h = $(".stage-copy h2", stageP.parentNode).getBoundingClientRect();
    const note = myPin.querySelector(".note");
    note.style.rotate = "-41deg";                               // same tilt as the Figma envelope
    const nh = note.offsetHeight || r.width * 0.1;            // unrotated height
    let y = h.top - r.top - nh * 0.3;                         // envelope sits just above the heading
    if (h.top < r.top + r.height * 0.3) y = r.height * 0.6;    // heading above the arch (phones)
    myPin.style.left = "50%";
    myPin.style.top = (y / r.height) * 100 + "%";
  }

  function stagePoint(e) {
    const r = stageP.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * arch.W, y: ((e.clientY - r.top) / r.height) * arch.H, r };
  }
  function pinDown(e) {
    e.preventDefault();
    myPin.setPointerCapture(e.pointerId);
    myPin.classList.add("dragging");
    const move = (ev) => {
      const p = stagePoint(ev);
      myPin.style.left = (p.x / arch.W) * 100 + "%";
      myPin.style.top = (p.y / arch.H) * 100 + "%";
      relayoutPlace(true, arch.nearestS(p.x, p.y)); // others make room live
    };
    const up = (ev) => {
      myPin.removeEventListener("pointermove", move);
      myPin.classList.remove("dragging");
      const p = stagePoint(ev);
      draft.s = arch.nearestS(p.x, p.y);   // snap to the nearest line
      relayoutPlace(false); saveDraft();
    };
    myPin.addEventListener("pointermove", move);
    myPin.addEventListener("pointerup", up, { once: true });
    myPin.addEventListener("pointercancel", up, { once: true });
  }

  sendBtn.addEventListener("click", async () => {
    if (!draft.from || !draft.text) { go("write"); return; }
    if (draft.s == null) return;
    sendBtn.disabled = true; sendBtn.textContent = "Sending…";
    try {
      const res = await WeddingAPI.sendMessage({
        from: draft.from, text: draft.text, font: draft.font, size: draft.size,
        flowers: draft.flowers, pos: +(draft.s / arch.L).toFixed(4)
      });
      clearDraft();
      go("home");
      await loadNotes(res.id);
      toast("Your letter is on the arch. Thank you!", 4500);
    } catch (err) {
      toast(err && /allowed/i.test(err.message) ? err.message : "Couldn't send your letter. Please try again.");
    } finally {
      sendBtn.disabled = draft.s == null; sendBtn.textContent = "Send Message";
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
