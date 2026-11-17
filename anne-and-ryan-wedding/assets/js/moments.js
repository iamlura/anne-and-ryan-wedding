/* Our Story photos: a revolving strip that never ends (Nov 17).
   The 22 photos are repeated once (copies are hidden from screen readers). The strip drifts left on its own;
   guests can also swipe, drag or scroll it either way. Whenever it passes one full set it jumps back (or forward)
   by exactly one set, which looks identical, so it never runs out. Drifting pauses while someone is touching,
   dragging or hovering it, and doesn't run at all with "reduce motion" switched on (swiping still loops). */
(function () {
  const box = document.querySelector(".moments");
  const track = box && box.querySelector(".moments__track");
  if (!track) return;
  const originals = Array.from(track.children);
  originals.forEach((img) => {
    const c = img.cloneNode(true);
    c.alt = ""; c.setAttribute("aria-hidden", "true");
    track.appendChild(c);
  });
  const first = originals[0], firstCopy = track.children[originals.length];
  let set = 0;                                   // width of one set of photos (incl. their gaps)
  const measure = () => { set = firstCopy.offsetLeft - first.offsetLeft; };
  measure();
  window.addEventListener("resize", measure);

  let pos = 0;                                   // float position (scrollLeft rounds on some browsers)
  const wrap = () => {
    if (!set) return;
    if (pos >= set) pos -= set;
    else if (pos < 0) pos += set;
    box.scrollLeft = pos;
  };
  box.addEventListener("scroll", () => {         // the guest scrolled / swiped: follow them and keep looping
    if (Math.abs(box.scrollLeft - pos) > 1) { pos = box.scrollLeft; wrap(); }
  }, { passive: true });

  // pause while hovered (mouse), touched, or dragged; resume a moment after
  let hold = false, resumeAt = 0;
  const pause = () => { hold = true; };
  const resume = (ms) => { hold = false; resumeAt = performance.now() + (ms || 0); };
  box.addEventListener("mouseenter", pause);
  box.addEventListener("mouseleave", () => resume(0));
  box.addEventListener("touchstart", pause, { passive: true });
  box.addEventListener("touchend", () => resume(1500), { passive: true });
  box.addEventListener("wheel", () => { resumeAt = performance.now() + 1500; }, { passive: true });

  // drag with the mouse on desktop
  let dragX = null, dragPos = 0, moved = false;
  box.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    dragX = e.clientX; dragPos = pos; moved = false; box.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX; if (Math.abs(dx) > 3) moved = true;
    pos = dragPos - dx; wrap();
  });
  window.addEventListener("pointerup", () => { if (dragX !== null) { dragX = null; box.classList.remove("is-dragging"); } });
  box.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const speed = () => (window.innerWidth <= 760 ? 22 : 34);   // px per second
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(64, now - last); last = now;
    if (!still.matches && !hold && dragX === null && now >= resumeAt && set) { pos += speed() * dt / 1000; wrap(); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
