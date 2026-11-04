/* Wedding facts that appear on more than one page.
   Edit them here and every page updates (landing, Event Details, RSVP).
   The HTML keeps the same text as a fallback, so pages still read fine without JS.

   Used by elements with data-c="...":
     date       "December 26, 2026"   (landing venue block, Event Details)
     weekday    "Saturday"            (landing, mobile)
     time       "3:00 PM"
     venue      "San Sebastian Cathedral"
     rsvpBy     "Dec 1, 2026"         (RSVP intro)
     itinerary  the <ol class="timeline"> lists (landing + Event Details)
     calendar   the Sun–Sat strip on the landing page (built from date)
*/
window.WEDDING = {
  date: "2026-12-26", // YYYY-MM-DD
  time: "3:00 PM",
  venue: "San Sebastian Cathedral",
  rsvpBy: "Dec 1, 2026",
  itinerary: [
    { time: "3:00 PM", what: "Wedding Mass at San Sebastian Cathedral" },
    { time: "4:00 PM", what: "Reception at Manila Hotel" },
    { time: "6:00 PM", what: "Dancing and Cocktail Hour" },
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
    rsvpBy: W.rsvpBy,
  };
  const set = (key, fn) => document.querySelectorAll(`[data-c="${key}"]`).forEach(fn);

  Object.keys(text).forEach((k) => set(k, (el) => { el.textContent = text[k]; }));

  set("itinerary", (ol) => {
    ol.innerHTML = W.itinerary
      .map((it) => `<li><div><p class="tt">${it.time}</p><p class="tl">${it.what}</p></div></li>`)
      .join("");
  });

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
