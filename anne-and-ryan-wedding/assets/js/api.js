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
