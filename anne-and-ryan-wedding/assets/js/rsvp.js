/* RSVP with invite codes (Nov 15).
   The guest logs in on invite.html (code from their email). Here: one answer per guest in their party
   (accept / decline + dietary), a name field for a "Plus One" seat. Earlier answers are filled in, so a guest
   can come back and change them. Saved by Apps Script into the Guests tab (action rsvp_party). */
(function () {
  const $ = (s) => document.querySelector(s);
  const guest = window.Guest && Guest.get();
  if (!guest) { location.replace("invite.html?next=rsvp.html"); return; }

  const list = $("#guestList"), form = $("#partyForm"), submit = $("#rsvpSubmit"), msg = $("#rsvpMsg");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const W = window.WEDDING || {};
  const seats = guest.guests.length;
  $("#partyTitle").textContent = guest.name;
  $("#partySub").textContent = `We have reserved ${seats} ${seats === 1 ? "seat" : "seats"} for you! Please let us know who will be joining us by ${W.rsvpBy || "Dec 5, 2026"}, with one answer for each guest.`;

  list.innerHTML = guest.guests.map((g, i) => {
    const plus = !!g.plusOne;
    const ck = (v) => (g.attending === v ? " checked" : "");
    return `${i ? '<hr class="rrule">' : '<hr class="rrule">'}
    <fieldset class="guest" data-i="${i}" style="border:0;padding:0;margin:0">
      <legend class="guest__name">${i + 1}. ${plus ? "Your plus one" : esc(g.name)}</legend>
      ${plus ? `<div class="rfield"><label for="pn${i}">Their first and last name</label>
        <input class="rinput" id="pn${i}" data-k="pname" autocomplete="off" placeholder="Jane Doe" maxlength="80" value="${esc(g.name || "")}"></div>
        <p class="lab-sc">Will they be attending?</p>` : ""}
      <div class="pills" role="radiogroup" aria-label="${plus ? "Will your plus one attend?" : esc(g.name) + ": will you attend?"}">
        <label class="pill"><input type="radio" name="att${i}" value="Yes"${ck("Yes")}>Joyfully accepts</label>
        <label class="pill"><input type="radio" name="att${i}" value="No"${ck("No")}>Respectfully declines</label>
      </div>
      <div class="rfield" data-food hidden>
        <label for="food${i}">Special dietary requirements</label>
        <input class="rinput" id="food${i}" data-k="food" placeholder="Allergies, or “none”" maxlength="200" value="${esc(g.food || "")}">
      </div>
    </fieldset>`;
  }).join("");

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
  // every guest answers; accepting guests fill dietary; an accepting plus one needs a name
  const complete = (a) => a.every((g) => g.attending && (g.attending === "No" || (g.food && (!g.plusOne || g.name))));
  function refresh() {
    list.querySelectorAll(".guest").forEach((fs) => { fs.querySelector("[data-food]").hidden = (fs.querySelector("input[type=radio]:checked") || {}).value !== "Yes"; });
    submit.disabled = !complete(answers());
  }
  form.addEventListener("input", refresh); form.addEventListener("change", refresh); refresh();

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
      document.querySelectorAll("[data-rstep]").forEach((el) => el.classList.toggle("is-active", el.dataset.rstep === "done"));
      $("#rsvpTitle").textContent = "Thank you!";
    } catch (err) {
      msg.textContent = "Couldn’t send your RSVP. Please try again in a moment.";
    } finally { submit.textContent = "Submit"; refresh(); }
  });
})();
