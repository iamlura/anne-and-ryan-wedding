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
