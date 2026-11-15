/* Wedding facts that appear on more than one page.
   Edit them here and every page updates (landing, Event Details, RSVP).
   The HTML keeps the same text as a fallback, so pages still read fine without JS.

   Used by elements with data-c="...":
     date          "December 26, 2026"   (landing hero + When, The Details)
     weekday       "Saturday"            (landing When)
     time          "2:30 PM"             (ceremony)
     venue / venueCity, reception / receptionCity / receptionTime
     rsvpBy        "Dec 5, 2026"         (RSVP intro)
     rsvpByLong    "December 5, 2026"    (every footer)
     itinerary     the <ol class="schedule"> on The Details (time, dot, label)
   The landing countdown counts to ceremonyISO.
*/
window.WEDDING = {
  date: "2026-12-26", // YYYY-MM-DD
  time: "2:30 PM",
  ceremonyISO: "2026-12-26T14:30:00+08:00", // landing countdown target (Manila time)
  venue: "Minor Basilica of San Sebastian",
  venueCity: "Quiapo, Manila",
  receptionTime: "4:30 PM",
  reception: "Champagne Room, The Manila Hotel",
  receptionCity: "Ermita, Manila",
  rsvpBy: "Dec 5, 2026",
  rsvpByLong: "December 5, 2026",
  itinerary: [
    { time: "2:30 PM", what: "Wedding Ceremony" },
    { time: "4:30 PM", what: "Cocktail Hour" },
    { time: "5:30 PM", what: "Dinner" },
    { time: "8:30 PM", what: "Farewell" },
  ],
};

(function () {
  const W = window.WEDDING;
  const [y, m, d] = W.date.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const SHORT = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];

  const text = {
    date: `${MONTHS[m - 1]} ${d}, ${y}`,
    weekday: DAYS[day.getDay()],
    time: W.time,
    venue: W.venue,
    venueCity: W.venueCity,
    receptionTime: W.receptionTime,
    reception: W.reception,
    receptionCity: W.receptionCity,
    rsvpBy: W.rsvpBy,
    rsvpByLong: W.rsvpByLong,
  };
  const set = (key, fn) => document.querySelectorAll(`[data-c="${key}"]`).forEach(fn);

  Object.keys(text).forEach((k) => set(k, (el) => { el.textContent = text[k]; }));

  set("itinerary", (ol) => {
    ol.innerHTML = W.itinerary
      .map((it) => `<li><p class="tt">${it.time}</p><span class="dot"></span><p class="tl">${it.what}</p></li>`)
      .join("");
  });

  // landing countdown (days / hours / minutes / seconds), stops at zero
  const cd = document.querySelector("[data-countdown]");
  if (cd) {
    const target = new Date(W.ceremonyISO).getTime();
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let t = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const v = { d: Math.floor(t / 86400), h: Math.floor(t / 3600) % 24, m: Math.floor(t / 60) % 60, s: t % 60 };
      cd.querySelectorAll("[data-cd]").forEach((el) => { const k = el.dataset.cd; el.textContent = k === "d" ? v.d : pad(v[k]); });
      if (t > 0) setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
  }

  set("calendar", (cal) => {
    const start = new Date(day); start.setDate(d - day.getDay());
    let html = "";
    for (let i = 0; i < 7; i++) {
      const c = new Date(start); c.setDate(start.getDate() + i);
      const on = c.getTime() === day.getTime() ? " is-on" : "";
      html += `<div class="cal__day${on}"><span class="dn">${SHORT[i]}</span><span class="dd">${c.getDate()}</span></div>`;
    }
    cal.innerHTML = html;
  });
})();
