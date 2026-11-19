/* Data layer. Talks to the Google Apps Script web app (apps-script/Code.gs).
   Requests are sent as text/plain so the browser skips the CORS preflight that Apps Script can't answer.
   With no SHEETS_URL configured, falls back to localStorage (demo mode). */
(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const URL_ = (cfg.SHEETS_URL || "").trim();
  const DEMO = !URL_;
  const FORM = cfg.RSVP_FORM || {};
  const FORM_ON = !!(FORM.action || "").trim();
  const ATTEND_LABEL = { Yes: "Joyfully accepts", No: "Respectfully declines" }; // the Google Form's choices
  const LS_RSVP = "ar_rsvps", LS_MSG = "ar_messages";
  // Demo mode only. With Sheets connected the password lives in Apps Script and is checked server-side.
  const DEMO_PASSWORD = "261226";
  // Demo mode only: a sample invitation (last name "Santos") so the RSVP flow can be tried without the Sheet.
  const DEMO_PARTY = { name: "Santos Family", code: "AR-7K2QX9", table: "5", email: "maria@example.com", replied: false,
    guests: [{ row: 2, name: "Maria Santos" }, { row: 3, name: "Jose Santos" }, { row: 4, name: "Ana Santos" }, { row: 5, name: "", plusOne: true }] };

  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch (e) { return []; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function post(body) {
    const res = await fetch(URL_, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      redirect: "follow"
    });
    if (!res.ok) throw new Error("Network error (" + res.status + ")");
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Something went wrong");
    return data;
  }

  async function get(params) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(URL_ + (URL_.includes("?") ? "&" : "?") + q, { redirect: "follow" });
    if (!res.ok) throw new Error("Network error (" + res.status + ")");
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Something went wrong");
    return data;
  }

  window.WeddingAPI = {
    demo: DEMO,
    rsvpToForm: FORM_ON,

    async submitRSVP(r) {
      if (FORM_ON) {
        if (r.website) return { ok: true };            // honeypot: bots fill hidden fields
        const body = new URLSearchParams();
        body.append(FORM.name, r.name || "");
        body.append(FORM.email, r.email || "");
        body.append(FORM.attending, ATTEND_LABEL[r.attending] || "");
        body.append(FORM.food, r.attending === "Yes" ? (r.food || "") : "");
        // Google Forms doesn't allow reading the reply (no-cors), so a network error is the only failure we can see.
        await fetch(FORM.action, { method: "POST", mode: "no-cors", body });
        return { ok: true };
      }
      if (DEMO) { await sleep(500); const all = lsGet(LS_RSVP); all.push({ ...r, t: Date.now() }); lsSet(LS_RSVP, all); return { ok: true }; }
      return post({ action: "rsvp", ...r });
    },

    /* ---- guest list (Nov 15). Since Nov 17 guests find their invitation by last name; the party's code is only
       an internal id now (guests never see or type it) ---- */
    async find(last) {
      if (DEMO) {
        await sleep(400);
        return { ok: true, parties: /^santos$/i.test(String(last || "").trim()) ? [{ code: DEMO_PARTY.code, name: DEMO_PARTY.name }] : [] };
      }
      return post({ action: "find", last });
    },
    /* wakes the Apps Script up (first request after a pause is the slowest) */
    ping() { if (!DEMO) fetch(URL_, { redirect: "follow" }).catch(() => {}); },
    async login(code) {
      if (DEMO) {
        await sleep(300);
        if (code !== DEMO_PARTY.code) throw new Error("nomatch");
        return { ok: true, party: DEMO_PARTY };
      }
      return post({ action: "login", code });
    },
    async rsvpParty(code, guests, extra) {
      if (DEMO) { await sleep(500); const all = lsGet(LS_RSVP); all.push({ code, guests, t: Date.now() }); lsSet(LS_RSVP, all); return { ok: true }; }
      return post({ action: "rsvp_party", code, guests, ...(extra || {}) });
    },

    /* Public list for the arch: no message text, only who + bouquet + position */
    async listNotes() {
      if (DEMO) {
        await sleep(150);
        return lsGet(LS_MSG).map(({ id, from, flowers, pos, t }) => ({ id, from, flowers, pos, t }));
      }
      const d = await get({ action: "notes" });
      return d.notes || [];
    },

    async sendMessage(m) {
      if (DEMO) {
        await sleep(500);
        const all = lsGet(LS_MSG);
        const rec = { ...m, id: "m" + Date.now().toString(36), t: Date.now() };
        all.push(rec); lsSet(LS_MSG, all);
        return { ok: true, id: rec.id, t: rec.t };
      }
      return post({ action: "message", ...m });
    },

    /* Full messages, password-gated */
    async openInbox(password) {
      if (DEMO) {
        await sleep(300);
        if (String(password).trim() !== DEMO_PASSWORD) throw new Error("Wrong password");
        return { ok: true, messages: lsGet(LS_MSG) };
      }
      return post({ action: "inbox", password });
    }
  };
})();
