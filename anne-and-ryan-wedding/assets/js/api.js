/* Data layer. Talks to the Google Apps Script web app (apps-script/Code.gs).
   Requests are sent as text/plain so the browser skips the CORS preflight that Apps Script can't answer.
   With no SHEETS_URL configured, falls back to localStorage (demo mode). */
(function () {
  const cfg = window.WEDDING_CONFIG || {};
  const URL_ = (cfg.SHEETS_URL || "").trim();
  const DEMO = !URL_;
  const LS_RSVP = "ar_rsvps", LS_MSG = "ar_messages";
  const LS_MINE = "ar_mine"; // [{id, token}] letters sent from this browser (lets the guest delete them)
  // Demo mode only. With Sheets connected the password lives in Apps Script and is checked server-side.
  const DEMO_PASSWORD = "261226";

  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch (e) { return []; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function newToken() {
    const a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  const mine = {
    list() { return lsGet(LS_MINE); },
    token(id) { const m = lsGet(LS_MINE).find((x) => x.id === id); return m ? m.token : ""; },
    has(id) { return !!this.token(id); },
    add(id, token) { const all = lsGet(LS_MINE).filter((x) => x.id !== id); all.push({ id, token }); lsSet(LS_MINE, all); },
    remove(id) { lsSet(LS_MINE, lsGet(LS_MINE).filter((x) => x.id !== id)); }
  };

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
    mine,

    async submitRSVP(r) {
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

    /* Sends a letter with a random delete token. The token is kept in this browser (mine) so the
       guest can delete their own letter later; the server only stores a hash of it. */
    async sendMessage(m) {
      const token = newToken();
      let res;
      if (DEMO) {
        await sleep(500);
        const all = lsGet(LS_MSG);
        const rec = { ...m, token, id: "m" + Date.now().toString(36), t: Date.now() };
        all.push(rec); lsSet(LS_MSG, all);
        res = { ok: true, id: rec.id, t: rec.t };
      } else {
        res = await post({ action: "message", ...m, token });
      }
      mine.add(res.id, token);
      return res;
    },

    /* Deletes a letter sent from this browser. */
    async deleteMessage(id) {
      const token = mine.token(id);
      if (!token) throw new Error("This letter wasn't sent from this browser.");
      if (DEMO) {
        await sleep(300);
        const all = lsGet(LS_MSG);
        const rec = all.find((x) => x.id === id);
        if (rec && rec.token !== token) throw new Error("Couldn't delete this letter.");
        lsSet(LS_MSG, all.filter((x) => x.id !== id));
      } else {
        await post({ action: "delete", id, token });
      }
      mine.remove(id);
      return { ok: true };
    },

    /* Full messages, password-gated */
    async openInbox(password) {
      if (DEMO) {
        await sleep(300);
        if (String(password).trim() !== DEMO_PASSWORD) throw new Error("Wrong password");
        return { ok: true, messages: lsGet(LS_MSG).map(({ token, ...m }) => m) };
      }
      return post({ action: "inbox", password });
    }
  };
})();
