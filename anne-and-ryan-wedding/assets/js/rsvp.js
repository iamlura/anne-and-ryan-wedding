/* RSVP by last name (Nov 17; invite codes removed).
   find: the guest types their last name → Apps Script returns the invitations with a guest of that last name
   (action find). One match opens it, several show a list to pick from (pick). party: one answer per guest
   (accept / decline + dietary), a name field for a "Plus One" seat. Earlier answers are filled in, so a guest can
   come back and change them. The picked invitation is kept in this browser (Guest, common.js), so the landing
   welcome and "Your Table" on The Details still work. Saved by Apps Script into the Guests tab (action rsvp_party). */
(function () {
  const $ = (s) => document.querySelector(s);
  const card = $(".rsvp__card");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const show = (step) => {
    document.querySelectorAll("[data-rstep]").forEach((el) => el.classList.toggle("is-active", el.dataset.rstep === step));
    $("#rsvpTitle").textContent = step === "done" ? "Thank you!" : "RSVP";
  };
  let guest = null;

  /* ---- find by last name ---- */
  const last = $("#last"), hint = $("#findHint"), findBtn = $("#findBtn");
  const HINT = hint.textContent;
  const notFound = (msg) => { hint.textContent = msg; hint.classList.add("is-error"); last.classList.add("is-error"); };
  last.addEventListener("input", () => { hint.textContent = HINT; hint.classList.remove("is-error"); last.classList.remove("is-error"); });
  $("#findForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = last.value.trim();
    if (q.replace(/[^\p{L}]/gu, "").length < 2) { last.focus(); return; }
    findBtn.disabled = true; findBtn.textContent = "Searching…";
    try {
      const r = await WeddingAPI.find(q);
      const ps = r.parties || [];
      if (!ps.length) notFound("We couldn’t find that name. Please check the spelling and enter your last name only.");
      else if (ps.length === 1) await open(ps[0].code);
      else {
        $("#pickText").textContent = `We found ${ps.length} invitations for “${q}”. Which one is yours?`;
        $("#pickList").innerHTML = ps.map((p) => `<button type="button" data-code="${esc(p.code)}">${esc(p.name)}</button>`).join("");
        show("pick");
      }
    } catch (err) {
      notFound("Couldn’t search right now. Please try again in a moment.");
    } finally { findBtn.disabled = false; findBtn.textContent = "Find my invitation"; }
  });
  $("#pickList").addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-code]"); if (!b) return;
    b.disabled = true;
    try { await open(b.dataset.code); } catch (err) { toast && toast("Couldn’t open that invitation. Please try again."); }
    finally { b.disabled = false; }
  });
  document.querySelectorAll("[data-again]").forEach((b) => b.addEventListener("click", () => {
    Guest.clear(); guest = null; last.value = ""; show("find"); last.focus();
  }));

  async function open(id) {
    const r = await WeddingAPI.login(id);
    guest = r.party; Guest.set(guest);
    drawParty();
  }

  /* ---- answer for each guest ---- */
  const list = $("#guestList"), form = $("#partyForm"), submit = $("#rsvpSubmit"), msg = $("#rsvpMsg");
  function drawParty() {
    const seats = guest.guests.length, solo = seats === 1;
    $("#partyTitle").textContent = guest.name;
    $("#partySub").textContent = `We have reserved ${seats} ${solo ? "seat" : "seats"} for you.`;
    msg.textContent = "";
    list.innerHTML = guest.guests.map((g, i) => {
      const plus = !!g.plusOne;
      const ck = (v) => (g.attending === v ? " checked" : "");
      return `<hr class="rrule">
      <fieldset class="guest" data-i="${i}" style="border:0;padding:0;margin:0">
        <legend class="guest__name${solo ? " sr-only" : ""}">${plus ? "Your plus one" : esc(g.name)}</legend>
        ${plus ? `<div class="rfield"><label for="pn${i}">Their first and last name</label>
          <input class="rinput" id="pn${i}" data-k="pname" autocomplete="off" placeholder="Jane Doe" maxlength="80" value="${esc(g.name || "")}"></div>
          <p class="lab-sc">Will they be attending?</p>` : ""}
        <div class="pills" role="radiogroup" aria-label="${plus ? "Will your plus one attend?" : esc(g.name) + ": will you attend?"}">
          <label class="pill"><input type="radio" name="att${i}" value="Yes"${ck("Yes")}>Joyfully accepts</label>
          <label class="pill"><input type="radio" name="att${i}" value="No"${ck("No")}>Respectfully declines</label>
        </div>
        <div class="rfield" data-food hidden>
          <label for="food${i}">Special dietary requirements</label>
          <input class="rinput" id="food${i}" data-k="food" placeholder="Optional, e.g. allergies" maxlength="200" value="${esc(g.food || "")}">
        </div>
      </fieldset>`;
    }).join("");
    refresh();
    show("party");
  }

  function answers() {
    return Array.from(list.querySelectorAll(".guest")).map((fs) => {
      const g = guest.guests[+fs.dataset.i];
      return {
        row: g.row, plusOne: !!g.plusOne,
        name: g.plusOne ? ((fs.querySelector("[data-k=pname]") || {}).value || "").trim() : g.name,
        attending: (fs.querySelector("input[type=radio]:checked") || {}).value || "",
        food: ((fs.querySelector("[data-k=food]") || {}).value || "").trim()
      };
    });
  }
  // every guest answers; dietary is optional (Anne, Nov 19); an accepting plus one needs a name
  const complete = (a) => a.length && a.every((g) => g.attending && (g.attending === "No" || !g.plusOne || g.name));
  function refresh() {
    list.querySelectorAll(".guest").forEach((fs) => { fs.querySelector("[data-food]").hidden = (fs.querySelector("input[type=radio]:checked") || {}).value !== "Yes"; });
    submit.disabled = !guest || !complete(answers());
  }
  form.addEventListener("input", refresh); form.addEventListener("change", refresh);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const a = answers();
    if (!complete(a)) return;
    if (window.ContentFilter && ContentFilter.hasBadWords(a.map((g) => g.name + " " + g.food).join(" "))) { msg.textContent = "Please keep it friendly — check the names and dietary requirements."; return; }
    submit.disabled = true; submit.textContent = "Sending…"; msg.textContent = "";
    try {
      await WeddingAPI.rsvpParty(guest.code, a.map(({ row, attending, food, name }) => ({ row, attending, food, name })), { email: guest.email || "", website: form.elements.website.value });
      guest.guests = guest.guests.map((g, i) => ({ ...g, attending: a[i].attending, food: a[i].food, name: g.plusOne ? a[i].name : g.name }));
      guest.replied = true; Guest.set(guest);
      const coming = a.some((g) => g.attending === "Yes");
      $("#rsvpDoneText").textContent = coming ? `We can’t wait to see you, ${guest.name}!` : "We’ll miss you. Thank you for letting us know.";
      show("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      msg.textContent = "Couldn’t send your RSVP. Please try again in a moment.";
    } finally { submit.textContent = "Submit"; refresh(); }
  });

  // came back on this browser after picking an invitation: open it again, otherwise start with the search
  const saved = window.Guest && Guest.get();
  if (saved && saved.code && saved.guests) { guest = saved; drawParty(); } else show("find");
  card.removeAttribute("data-wait");
})();
