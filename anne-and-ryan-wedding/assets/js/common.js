/* Shared: mobile menu, fade-ins, story carousel, toast */
(function () {
  // ---- mobile menu (built from the nav links) ----
  const nav = document.querySelector("[data-nav]");
  const burger = document.querySelector("[data-burger]");
  if (nav && burger) {
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-label", "Menu");
    nav.querySelectorAll("a").forEach((a) => menu.appendChild(a.cloneNode(true)));
    const close = document.createElement("button");
    close.className = "menu-close"; close.setAttribute("aria-label", "Close menu"); close.innerHTML = "&times;";
    menu.appendChild(close);
    document.body.appendChild(menu);
    const toggle = (open) => { menu.classList.toggle("open", open); document.body.style.overflow = open ? "hidden" : ""; };
    burger.addEventListener("click", () => toggle(true));
    close.addEventListener("click", () => toggle(false));
    menu.addEventListener("click", (e) => { if (e.target.tagName === "A") toggle(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
  }

  // ---- nav: hides while scrolling down, comes back as soon as the guest scrolls up (designer, Nov 19) ----
  if (nav) {
    let lastY = window.scrollY, ticking = false;
    const onScroll = () => {
      const y = Math.max(0, window.scrollY), h = nav.offsetHeight;
      if (document.body.style.overflow === "hidden") { ticking = false; return; } // menu / inbox open
      if (y <= h) nav.classList.remove("nav--hidden");                   // near the top: always shown
      else if (y > lastY + 4) nav.classList.add("nav--hidden");          // scrolling down
      else if (y < lastY - 4) nav.classList.remove("nav--hidden");       // scrolling up
      if (Math.abs(y - lastY) > 4) lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    nav.addEventListener("focusin", () => nav.classList.remove("nav--hidden")); // keyboard users always see it
  }

  // ---- FAQ: "Show bank QR" opens the codes in a popup; X, the dark overlay or Esc closes it (designer, Nov 19) ----
  const qrPop = document.getElementById("qrPop"), qrOpen = document.querySelector("[data-qr-open]");
  if (qrPop && qrOpen) {
    const openQr = () => {
      qrPop.hidden = false; document.body.style.overflow = "hidden";
      requestAnimationFrame(() => qrPop.classList.add("open"));
      qrPop.querySelector("[data-qr-close]").focus();
    };
    const closeQr = () => {
      qrPop.classList.remove("open"); document.body.style.overflow = "";
      setTimeout(() => { qrPop.hidden = true; }, 250); qrOpen.focus();
    };
    qrOpen.addEventListener("click", openQr);
    qrPop.addEventListener("click", (e) => { if (e.target.tagName !== "IMG") closeQr(); }); // overlay or X
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !qrPop.hidden) closeQr(); });
  }

  // ---- fade in on scroll ----
  const els = document.querySelectorAll("[data-fade]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("in"));
  }

  // ---- story carousel ----
  const track = document.querySelector("[data-track]");
  if (track) {
    const prev = document.querySelector("[data-prev]");
    const next = document.querySelector("[data-next]");
    const step = () => {
      const card = track.querySelector(".story-card");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : 400;
    };
    const update = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); }
    });
    window.addEventListener("resize", update);
    update();
  }

  // ---- guest session: the invitation a guest found on the RSVP page (by last name since Nov 17), kept in this browser ----
  const KEY = "ar_guest";
  window.Guest = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } },
    set(party) { try { localStorage.setItem(KEY, JSON.stringify(party)); } catch (e) {} },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  };
  const guest = window.Guest.get();
  if (guest) {
    // landing: "Welcome, Santos Family" + Continue (Figma "welcome")
    document.querySelectorAll("[data-welcome]").forEach((el) => { el.textContent = `Welcome, ${guest.name}`; el.hidden = false; });
    document.querySelectorAll("[data-continue]").forEach((el) => { el.hidden = false; });
    // The Details: "Your Table" (Figma "The Details logged in"), only once a table is filled in
    if (guest.table) document.querySelectorAll("[data-table]").forEach((el) => {
      el.hidden = false; el.querySelector("[data-table-val]").textContent = /^\d+$/.test(guest.table) ? `Table ${guest.table}` : guest.table;
      const rule = el.previousElementSibling; if (rule && rule.classList.contains("rule")) rule.hidden = false;
    });
  }

  // ---- toast ----
  let toastEl, toastT;
  window.toast = function (msg, ms) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), ms || 2600);
  };

  if (window.WeddingAPI && window.WeddingAPI.demo) {
    const b = document.createElement("div");
    b.className = "demo-badge";
    b.textContent = "Demo mode: data saves to this browser only";
    document.body.appendChild(b);
  }
})();
