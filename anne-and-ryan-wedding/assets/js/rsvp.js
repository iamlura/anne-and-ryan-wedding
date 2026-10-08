(function () {
  const form = document.getElementById("rsvpForm");
  const btn = document.getElementById("rsvpSubmit");
  const msg = document.getElementById("rsvpMsg");
  const wrap = document.getElementById("rsvp");
  const food = document.getElementById("food");
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function values() {
    const fd = new FormData(form);
    return {
      name: (fd.get("name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      attending: fd.get("attending") || "",
      food: (fd.get("food") || "").trim(),
      website: fd.get("website") || ""
    };
  }

  // Submit stays at 50% until every field is done. Food restrictions only apply when attending.
  function complete(v) {
    if (!v.name || !emailOk(v.email) || !v.attending) return false;
    if (v.attending === "Yes" && !v.food) return false;
    return true;
  }

  function refresh() {
    const v = values();
    btn.disabled = !complete(v);
    document.getElementById("foodField").style.opacity = v.attending === "No" ? ".45" : "";
    food.disabled = v.attending === "No";
  }
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  refresh();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = values();
    if (!complete(v)) return;
    if (window.ContentFilter && (ContentFilter.hasBadWords(v.name) || ContentFilter.hasBadWords(v.food))) {
      msg.textContent = "Please keep it friendly — check your name and food restrictions.";
      return;
    }
    btn.disabled = true; btn.textContent = "sending…"; msg.textContent = "";
    try {
      await WeddingAPI.submitRSVP(v);
      document.getElementById("rsvpDoneText").textContent = v.attending === "Yes"
        ? `We can't wait to see you, ${v.name.split(" ")[0]}!`
        : `We'll miss you, ${v.name.split(" ")[0]}. Thank you for letting us know.`;
      wrap.classList.add("is-done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      msg.textContent = "Couldn't send your RSVP. Please try again in a moment.";
      btn.textContent = "submit"; refresh();
    }
  });
})();
