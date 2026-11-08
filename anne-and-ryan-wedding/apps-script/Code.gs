/**
 * Anne & Ryan wedding site backend (Google Apps Script, bound to a Google Sheet).
 *
 * Setup (5 min) is in README.md → "Connect Google Sheets". Short version:
 *   1. Create a Google Sheet → Extensions → Apps Script → paste this file.
 *   2. Run `setup` once (creates the Messages tab, stores the inbox password and makes the RSVP Google Form;
 *      the execution log prints the form links + entry IDs for assets/js/config.js → RSVP_FORM).
 *   3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → copy the URL.
 *   4. Paste the URL into assets/js/config.js (SHEETS_URL).
 *
 * RSVPs go to a Google Form (made by setup, answers land in this spreadsheet's "Form Responses 1" tab).
 * The site's own RSVP page posts straight into that form, so it keeps the Figma design.
 *
 * Endpoints
 *   GET  ?action=notes                → public arch data (no message text)
 *   POST {action:"rsvp", ...}         → append RSVP row
 *   POST {action:"message", ...}      → append message row
 *   POST {action:"inbox", password}   → all visible messages with text (password checked here, never in the browser)
 *   POST {action:"delete", id, token} → a guest deletes their own message (token was made in their browser when they sent it;
 *                                        only its SHA-256 hash is stored, in the delete_key column)
 *
 * Moderation: set the "hidden" column to TRUE on any message row to remove it from the arch and inbox.
 */

const RSVP_SHEET = "RSVP";
const MSG_SHEET = "Messages";
const RSVP_HEAD = ["timestamp", "name", "email", "attending", "food"];
const MSG_HEAD = ["id", "timestamp", "from", "text", "font", "size", "flowers", "pos", "hidden", "delete_key"];

const BAD_WORDS = [
  "fuck", "fuk", "fck", "shit", "bitch", "bastard", "asshole", "dick", "cock", "pussy", "cunt", "slut", "whore",
  "nigger", "nigga", "faggot", "fag", "retard", "motherfucker", "wtf", "porn", "sex", "nude", "rape", "kill yourself", "kys",
  "putangina", "putang ina", "tangina", "tang ina", "puta", "gago", "gaga", "bobo", "tanga", "ulol", "ulul", "tarantado",
  "lintik", "pakyu", "pakshet", "punyeta", "kupal", "hayop ka", "kantot", "puke", "pokpok", "inutil", "hindot"
];

/* ---------- one-time setup: run from the editor ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, MSG_SHEET, MSG_HEAD);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("INBOX_PASSWORD")) props.setProperty("INBOX_PASSWORD", "261226");
  setupRsvpForm_(ss, props);
  Logger.log("Ready. Inbox password: " + props.getProperty("INBOX_PASSWORD"));
}

/* Makes the RSVP Google Form once (same questions as the site), linked to this spreadsheet.
   Running setup again reuses it and just prints the links again. */
function setupRsvpForm_(ss, props) {
  let form = null;
  const id = props.getProperty("RSVP_FORM_ID");
  if (id) { try { form = FormApp.openById(id); } catch (x) { form = null; } }
  if (!form) {
    form = FormApp.create("Anne & Ryan · RSVP");
    form.setDescription("Saturday, December 26, 2026 · 2:30 PM · Minor Basilica of San Sebastian, Manila\nKindly reply by December 5, 2026.");
    form.setConfirmationMessage("Thank you! Your RSVP has been received.");
    form.setCollectEmail(false);
    form.setAllowResponseEdits(false);
    form.setLimitOneResponsePerUser(false);
    try { form.setRequireLogin(false); } catch (x) {}   // only exists on Workspace accounts
    form.addTextItem().setTitle("First and Last Name").setRequired(true);
    form.addTextItem().setTitle("Email Address").setRequired(true)
      .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
    form.addMultipleChoiceItem().setTitle("Will you be attending?")
      .setChoiceValues(["Joyfully accepts", "Respectfully declines"]).setRequired(true);
    form.addTextItem().setTitle("Special dietary requirements");
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
    props.setProperty("RSVP_FORM_ID", form.getId());
  }
  // entry IDs for the site (config.js → RSVP_FORM), read from a pre-filled link
  const items = form.getItems();
  let resp = form.createResponse();
  resp = resp.withItemResponse(items[0].asTextItem().createResponse("name"));
  resp = resp.withItemResponse(items[1].asTextItem().createResponse("email@x.com"));
  resp = resp.withItemResponse(items[2].asMultipleChoiceItem().createResponse("Joyfully accepts"));
  resp = resp.withItemResponse(items[3].asTextItem().createResponse("food"));
  const ids = (resp.toPrefilledUrl().match(/entry\.\d+/g) || []);
  const view = form.getPublishedUrl();
  Logger.log("RSVP form (share / edit): " + form.getEditUrl());
  Logger.log("RSVP_FORM = " + JSON.stringify({
    action: view.replace(/\/viewform.*$/, "/formResponse"),
    name: ids[0], email: ids[1], attending: ids[2], food: ids[3]
  }));
}

/* Change the inbox password: edit and run this. */
function setPassword() {
  PropertiesService.getScriptProperties().setProperty("INBOX_PASSWORD", "261226");
}

function ensureSheet_(ss, name, head) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(head);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight("bold");
  }
  return sh;
}

/* ---------- http ---------- */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || "";
    if (action === "notes") return json_({ ok: true, notes: readMessages_(false) });
    return json_({ ok: true, hello: "Anne & Ryan" });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    switch (body.action) {
      case "rsvp": lock.waitLock(10000); return json_(saveRsvp_(body));
      case "message": lock.waitLock(10000); return json_(saveMessage_(body));
      case "inbox": return json_(inbox_(body));
      case "delete": lock.waitLock(10000); return json_(deleteMessage_(body));
      default: return json_({ ok: false, error: "Unknown action" });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- actions ---------- */
function saveRsvp_(b) {
  if (b.website) return { ok: true };                     // honeypot: bots fill hidden fields
  const name = clean_(b.name, 80), email = clean_(b.email, 120);
  const attending = b.attending === "Yes" ? "Yes" : b.attending === "No" ? "No" : "";
  const food = clean_(b.food, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !attending) throw new Error("Please complete every field.");
  if (hasBadWords_(name) || hasBadWords_(food)) throw new Error("Some words aren't allowed here.");
  const sh = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), RSVP_SHEET, RSVP_HEAD);
  sh.appendRow([new Date(), name, email, attending, food]);
  return { ok: true };
}

function saveMessage_(b) {
  const from = clean_(b.from, 40), text = clean_(b.text, 1500, true);
  if (!from || !text) throw new Error("Please write your name and a message.");
  if (hasBadWords_(from) || hasBadWords_(text)) throw new Error("Some words in your message aren't allowed here.");
  const font = ["serif", "sans", "script"].indexOf(b.font) >= 0 ? b.font : "serif";
  const size = ["s", "m", "l"].indexOf(b.size) >= 0 ? b.size : "m";
  const flowers = (Array.isArray(b.flowers) ? b.flowers : []).slice(0, 4).map(function (f) {
    return { f: [1, 2, 3].indexOf(Number(f.f)) >= 0 ? Number(f.f) : 1, x: num_(f.x, 0, 1), y: num_(f.y, 0, 1), r: num_(f.r, -90, 90) };
  });
  const pos = num_(b.pos, 0, 1);
  const id = "m" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const sh = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), MSG_SHEET, MSG_HEAD);
  const token = String(b.token || "");
  const key = /^[a-f0-9]{32}$/.test(token) ? sha256_(token) : "";
  sh.appendRow([id, new Date(), from, text, font, size, JSON.stringify(flowers), pos, false, key]);
  return { ok: true, id: id, t: Date.now() };
}

function deleteMessage_(b) {
  const id = String(b.id || ""), token = String(b.token || "");
  if (!id || !/^[a-f0-9]{32}$/.test(token)) throw new Error("Couldn't delete this letter.");
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MSG_SHEET);
  if (!sh || sh.getLastRow() < 2) return { ok: true };
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, MSG_HEAD.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) !== id) continue;
    if (!rows[i][9] || String(rows[i][9]) !== sha256_(token)) throw new Error("Couldn't delete this letter.");
    sh.deleteRow(i + 2);
    return { ok: true };
  }
  return { ok: true };                                    // already gone
}

function inbox_(b) {
  const pw = PropertiesService.getScriptProperties().getProperty("INBOX_PASSWORD") || "261226";
  Utilities.sleep(400);                                   // slows down guessing
  if (String(b.password || "").trim() !== pw) throw new Error("Wrong password");
  return { ok: true, messages: readMessages_(true) };
}

function readMessages_(withText) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MSG_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, MSG_HEAD.length).getValues();
  return rows.filter(function (r) { return r[0] && String(r[8]).toUpperCase() !== "TRUE"; }).map(function (r) {
    let flowers = [];
    try { flowers = JSON.parse(r[6] || "[]"); } catch (x) {}
    const o = { id: String(r[0]), t: new Date(r[1]).getTime(), from: String(r[2]), flowers: flowers, pos: Number(r[7]) || 0 };
    if (withText) { o.text = String(r[3]); o.font = String(r[4] || "serif"); o.size = String(r[5] || "m"); }
    return o;
  });
}

/* ---------- helpers ---------- */
function clean_(v, max, multiline) {
  let s = String(v == null ? "" : v);
  s = multiline ? s.replace(/\r/g, "") : s.replace(/[\r\n\t]+/g, " ");
  s = s.replace(/^[=+\-@]/, "'$&");                       // stop spreadsheet formula injection
  return s.trim().slice(0, max);
}
function sha256_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, "0"); }).join("");
}
function num_(v, lo, hi) { const n = Number(v); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : lo; }

function hasBadWords_(text) {
  const leet = { "0": "o", "1": "i", "!": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s", "7": "t", "8": "b" };
  const n = String(text || "").toLowerCase().replace(/[0134578@$!]/g, function (c) { return leet[c] || c; })
    .normalize("NFD").replace(/[̀-ͯ]/g, "");
  const words = " " + n.replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ") + " ";
  return BAD_WORDS.some(function (w) {
    if (words.indexOf(" " + w + " ") >= 0) return true;
    const letters = w.replace(/\s/g, "").split("").join("\\s?");
    return new RegExp("\\s" + letters + "(s|es|ed|ing|in|er|ers)?\\s").test(words);
  });
}
