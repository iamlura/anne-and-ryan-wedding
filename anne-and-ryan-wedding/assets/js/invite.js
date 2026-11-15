/* Invite code gate (invite.html). */
(function () {
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const next = /^[a-z]+\.html(#[\w-]+)?$/.test(params.get("next") || "") ? params.get("next") : "index.html";
  const show = (step) => document.querySelectorAll("[data-gstep]").forEach((el) => el.classList.toggle("is-active", el.dataset.gstep === step));
  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => { show(b.dataset.go); const f = document.querySelector(`[data-gstep="${b.dataset.go}"] input`); if (f) f.focus(); }));

  const code = $("#code"), err = $("#codeErr"), btn = $("#codeBtn");
  const bad = (on) => { err.hidden = !on; code.classList.toggle("is-error", on); };
  code.addEventListener("input", () => bad(false));
  async function tryCode(value) {
    if (!value.trim()) { code.focus(); return; }
    btn.disabled = true; btn.textContent = "Opening…";
    try {
      const r = await WeddingAPI.login(value);
      Guest.set(r.party);
      location.href = next;
    } catch (e) {
      if (e.message === "nomatch") bad(true);
      else { err.textContent = "Couldn’t check your code right now. Please try again in a moment."; bad(true); }
      btn.disabled = false; btn.textContent = "Open Invitation";
    }
  }
  $("#codeForm").addEventListener("submit", (e) => { e.preventDefault(); tryCode(code.value); });
  if (params.get("code")) { code.value = params.get("code"); tryCode(code.value); }

  const femail = $("#femail"), ferr = $("#forgotErr");
  let lastEmail = "";
  const mask = (em) => { const [u, d] = em.split("@"); return u.slice(0, 1) + "••••@" + d; };
  async function sendCode(email) {
    ferr.hidden = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { ferr.textContent = "Please enter a valid email address."; ferr.hidden = false; return; }
    const b = $("#forgotBtn"); b.disabled = true;
    try {
      await WeddingAPI.forgot(email);
      lastEmail = email;
      $("#sentMsg").textContent = `Check your email! We’ve sent your invite code to ${mask(email)}.`;
      show("sent");
    } catch (e) { ferr.textContent = "Couldn’t send it right now. Please try again in a moment."; ferr.hidden = false; }
    finally { b.disabled = false; }
  }
  $("#forgotForm").addEventListener("submit", (e) => { e.preventDefault(); sendCode(femail.value.trim()); });
  $("#sendAgain").addEventListener("click", () => { if (lastEmail) sendCode(lastEmail).then(() => toast && toast("Sent again")); });
})();
