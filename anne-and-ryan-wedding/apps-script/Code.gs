/**
 * Anne & Ryan wedding site backend (Google Apps Script, bound to a Google Sheet).
 *
 * Since Nov 16 this is bound to Ryan's Sheet "Guest List for Wedding Website" (one Sheet for guest list, codes, RSVPs, letters).
 *   1. In that Sheet: Extensions → Apps Script → paste this file.
 *   2. Run `setupAll` once (Guests tab filled from the "Invite codes" tab, Messages tab, inbox password, old letters copied).
 *   3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → copy the URL.
 *   4. Paste the URL into assets/js/config.js (SHEETS_URL).
 *
 * RSVPs: one answer per guest, written into the Guests tab (+ a log row in the RSVP tab). The old `setup` / Google Form
 * (Nov 8) is no longer used by the site; don't run `setup` here (it would make a new form).
 *
 * Endpoints
 *   GET  ?action=notes                → public arch data (no message text)
 *   POST {action:"rsvp", ...}         → append RSVP row
 *   POST {action:"message", ...}      → append message row
 *   POST {action:"inbox", password}   → all visible messages with text (password checked here, never in the browser)
 *   POST {action:"login", code}       → guest list (Nov 15): the party for an invite code (names, table, earlier answers)
 *   POST {action:"forgot", email}     → emails the invite code again to that address (if it's on the Guests tab)
 *   POST {action:"rsvp_party", code, email, guests:[{row, attending, food, name}]} → writes each guest's answer
 *                                        into the Guests tab (RSVP / Dietary / Replied at / Plus one name) + an RSVP log row
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

/* ---------- guest list (Nov 9) ----------
   Run `setupGuests` once from the editor: it adds the "Guests" tab Anne fills in, and a "How to fill" tab.
   One row per guest. Rows with the same Party are one invitation (one code, one email).
   Grey columns are filled by the site/script later (invite codes, RSVP answers); Anne doesn't type in them. */
const GUEST_SHEET = "Guests";
const GUEST_HEAD = ["Party", "Guest name", "Email", "Seats reserved", "Plus-one allowed", "Child", "Invited to", "Table", "Notes",
                    "Invite code", "Invite sent", "RSVP", "Dietary requirements", "Replied at", "Plus one name"];
const G = { party: 0, name: 1, email: 2, table: 7, code: 9, sent: 10, rsvp: 11, food: 12, replied: 13, plusName: 14 };
const GUEST_AUTO_FROM = 10;   // column J onwards is automatic

function setupGuests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(GUEST_SHEET);
  if (!sh) sh = ss.insertSheet(GUEST_SHEET);
  sh.getRange(1, 1, 1, GUEST_HEAD.length).setValues([GUEST_HEAD]);   // safe to re-run: rewrites the header only
  const n = GUEST_HEAD.length;
  sh.setFrozenRows(1); sh.setFrozenColumns(2);
  const head = sh.getRange(1, 1, 1, n);
  head.setFontWeight("bold").setBackground("#511d21").setFontColor("#ffffff").setVerticalAlignment("middle");
  sh.getRange(1, GUEST_AUTO_FROM, 1, n - GUEST_AUTO_FROM + 1).setBackground("#8a8a8a");
  sh.getRange(2, GUEST_AUTO_FROM, 999, n - GUEST_AUTO_FROM + 1).setBackground("#f3f3f3");
  sh.setRowHeight(1, 32);
  [170, 200, 220, 110, 120, 70, 190, 70, 200, 110, 110, 160, 220, 140, 180].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  const yesNo = SpreadsheetApp.newDataValidation().requireValueInList(["Yes", "No"], true).setAllowInvalid(false).build();
  sh.getRange(2, 5, 999, 2).setDataValidation(yesNo);
  sh.getRange(2, 7, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(["Ceremony & Reception", "Ceremony only", "Reception only"], true).build());
  sh.getRange(2, 4, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireNumberBetween(1, 20).build());
  sh.getRange(2, 3, 999, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireTextIsEmail().setAllowInvalid(true).build());
  const notes = ["Same name on every row of one invitation, e.g. Santos Family", "One person per row, as it should appear on the RSVP",
    "Where the invite code is sent. Only needed on one row of the party", "Seats for the whole party, on the first row (counts plus-ones)",
    "Yes = this party may bring someone not named", "Yes if this guest is a child", "Which parts this guest is invited to",
    "Table number (can be filled in later)", "Anything else, only Anne sees this",
    "Automatic: made when invites are sent", "Automatic: date the email went out", "Automatic: the guest's answer",
    "Automatic: from the RSVP form", "Automatic: when they answered", "Automatic: the name a guest typed for their plus one"];
  notes.forEach(function (t, i) { sh.getRange(1, i + 1).setNote(t); });
  // how-to tab
  let how = ss.getSheetByName("How to fill");
  if (!how) how = ss.insertSheet("How to fill", sh.getIndex());
  how.clear();
  const rows = [
    ["How to fill the Guests tab"],
    ["1. One row per guest. Guests who share one invitation get the same Party name (e.g. Santos Family). A seat for an unnamed plus one is a row with Guest name \"Plus One\"."],
    ["2. Put the party's email on one of its rows. That's where the invite code goes."],
    ["3. Seats reserved: the total for the party, on its first row. If it's more than the names listed, the extra seats are plus-ones."],
    ["4. Plus-one allowed, Child and Invited to: pick from the dropdown."],
    ["5. Table: fill in whenever the seating is ready. Guests see it on the site after they log in."],
    ["6. Leave the grey columns alone. Run makeCodes to fill the invite codes, sendInvites to email them; the site fills in the RSVP answers."],
    [""],
    ["Example"],
  ];
  how.getRange(1, 1, rows.length, 1).setValues(rows);
  how.getRange(1, 1).setFontWeight("bold").setFontSize(14);
  how.getRange(9, 1).setFontWeight("bold");
  const ex = [GUEST_HEAD.slice(0, 9),
    ["Santos Family", "Maria Santos", "maria@example.com", 4, "No", "No", "Ceremony & Reception", 5, ""],
    ["Santos Family", "Jose Santos", "", "", "No", "No", "Ceremony & Reception", 5, ""],
    ["Santos Family", "Ana Santos", "", "", "No", "Yes", "Ceremony & Reception", 5, ""],
    ["Santos Family", "Miguel Santos", "", "", "No", "No", "Ceremony & Reception", 5, ""],
    ["Paolo Reyes", "Paolo Reyes", "paolo@example.com", 2, "Yes", "No", "Reception only", 8, "Plus-one not named yet"]];
  how.getRange(10, 1, ex.length, 9).setValues(ex);
  how.getRange(10, 1, 1, 9).setFontWeight("bold").setBackground("#511d21").setFontColor("#ffffff");
  how.setColumnWidth(1, 170); how.setColumnWidth(2, 160); how.setColumnWidth(3, 200); how.setColumnWidth(7, 190); how.setColumnWidth(9, 200);
  ss.setActiveSheet(sh);
}

/* ---------- one Sheet for everything (Nov 16) ----------
   The backend lives in Ryan's Sheet "Guest List for Wedding Website" (tabs "Guest List for Wedding Website" + "Invite codes").
   setupAll: Guests + How to fill tabs, Messages tab, inbox password, Guests rows from "Invite codes", letters from the old Sheet.
             Safe to re-run: fillGuests only adds invitations whose code isn't on the Guests tab yet, importOldMessages skips ids it has. */
const INVITE_SHEET = "Invite codes";
const OLD_SHEET_ID = "1oapFYPqkLcdA2HVhomGbhMsxTLJFqUznyo01xG-Pj1E";   // the first backend Sheet "Anne & Ryan wedding" (Nov 8 - 16)

function setupAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(GUEST_SHEET)) setupGuests();
  ensureSheet_(ss, MSG_SHEET, MSG_HEAD);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("INBOX_PASSWORD")) props.setProperty("INBOX_PASSWORD", "261226");
  fillGuests();
  importOldMessages();
}

/* "Invite codes" tab (one row per invitation: Side, Group, Invitation, Guests, Seats, Invite code) → Guests tab (one row per guest). */
function fillGuests() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = ss.getSheetByName(INVITE_SHEET);
  if (!src || src.getLastRow() < 2) throw new Error('No "' + INVITE_SHEET + '" tab with rows.');
  if (!ss.getSheetByName(GUEST_SHEET)) setupGuests();
  const sh = ss.getSheetByName(GUEST_SHEET);
  const head = src.getRange(1, 1, 1, src.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim().toLowerCase(); });
  const c = { side: head.indexOf("side"), group: head.indexOf("group"), inv: head.indexOf("invitation"),
              seats: head.indexOf("seats"), code: head.indexOf("invite code") };
  if (c.inv < 0 || c.code < 0) throw new Error('"' + INVITE_SHEET + '" needs the columns Invitation and Invite code.');
  const have = {}; guestRows_().rows.forEach(function (r) { const k = normCode_(r[G.code]); if (k) have[k] = 1; });
  const out = []; let added = 0;
  src.getRange(2, 1, src.getLastRow() - 1, src.getLastColumn()).getValues().forEach(function (r) {
    const cell = String(r[c.inv]).trim(), code = normCode_(r[c.code]);
    if (!cell || !code || have[code]) return;
    have[code] = 1; added++;
    const names = cell.split(/,\s*(?:and\s+)?|\s+and\s+/).map(function (n) { return n.trim(); }).filter(String);
    const isPlus = function (n) { return /^plus\s*one$/i.test(n); };
    const seats = (c.seats >= 0 && Number(r[c.seats])) || names.length;
    const note = [c.side >= 0 ? r[c.side] : "", c.group >= 0 ? r[c.group] : ""].filter(String).join(" · ");
    names.forEach(function (n, k) {
      out.push([cell, isPlus(n) ? "Plus One" : n, "", k === 0 ? seats : "", names.some(isPlus) ? "Yes" : "No", "No",
                "Ceremony & Reception", "", note, code]);
    });
  });
  if (out.length) sh.getRange(sh.getLastRow() + 1, 1, out.length, out[0].length).setValues(out);
  Logger.log(added + " invitations (" + out.length + " guest rows) added to " + GUEST_SHEET + ".");
}

/* Copies letters from the old backend Sheet's Messages tab (skips ids already here). */
function importOldMessages() {
  const sh = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), MSG_SHEET, MSG_HEAD);
  let old;
  try { old = SpreadsheetApp.openById(OLD_SHEET_ID).getSheetByName(MSG_SHEET); } catch (x) { Logger.log("Old Sheet not reachable: " + x); return; }
  if (!old || old.getLastRow() < 2) { Logger.log("No old letters."); return; }
  const have = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { have[r[0]] = 1; });
  const rows = old.getRange(2, 1, old.getLastRow() - 1, MSG_HEAD.length).getValues().filter(function (r) { return r[0] && !have[r[0]]; });
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, MSG_HEAD.length).setValues(rows);
  Logger.log(rows.length + " letters copied from the old Sheet.");
}

/* ---------- invite codes + invitation emails (Nov 15) ----------
   makeCodes:   gives every party without a code one code (same code on all its rows). Safe to re-run.
   sendInvites: emails every party that has an email and an empty "Invite sent". Safe to re-run (skips sent ones).
                Test first with sendTestInvite (sends the Santos-style email to you). */
const SITE_URL = "https://iamlura.github.io/anne-and-ryan-wedding/";
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";   // no 0/O, 1/I/L

function guestRows_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GUEST_SHEET);
  if (!sh || sh.getLastRow() < 2) return { sh: sh, rows: [] };
  return { sh: sh, rows: sh.getRange(2, 1, sh.getLastRow() - 1, GUEST_HEAD.length).getValues() };
}
function normCode_(c) {
  c = String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.indexOf("AR") === 0 && c.length === 8) c = c.slice(2);
  return c.length === 6 ? "AR-" + c : "";
}
function parties_(rows) {                                   // party name → [row indexes]
  const out = {};
  rows.forEach(function (r, i) { const p = String(r[G.party]).trim(); if (p && String(r[G.name]).trim()) (out[p] = out[p] || []).push(i); });
  return out;
}

function makeCodes() {
  const g = guestRows_(); if (!g.rows.length) throw new Error("Fill the Guests tab first.");
  const used = {}; g.rows.forEach(function (r) { if (r[G.code]) used[r[G.code]] = 1; });
  const ps = parties_(g.rows); let made = 0;
  Object.keys(ps).forEach(function (p) {
    const idx = ps[p];
    let code = idx.map(function (i) { return g.rows[i][G.code]; }).filter(String)[0];
    if (!code) {
      do { code = "AR-" + Array.from({ length: 6 }, function () { return CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]; }).join(""); } while (used[code]);
      used[code] = 1; made++;
    }
    idx.forEach(function (i) { g.sh.getRange(i + 2, G.code + 1).setValue(code); });
  });
  Logger.log(made + " new codes, " + Object.keys(ps).length + " parties.");
}

function inviteHtml_(party, code, seats) {
  const link = SITE_URL + "invite.html?code=" + encodeURIComponent(code);
  return '<div style="background:#f3efe8;font-family:Georgia,serif;color:#3a2a26;max-width:600px;margin:0 auto">' +
    '<div style="background:#390007;color:#f1eee7;text-align:center;padding:40px 24px"><div style="font-size:40px;font-style:italic">Anne &amp; Ryan</div></div>' +
    '<div style="text-align:center;padding:40px 40px 32px;line-height:1.5">' +
    '<div style="font-size:30px;font-style:italic;color:#4e0b12">Dear ' + party + ',</div>' +
    '<p>Anne and Ryan request the honor of your presence at the celebration of their marriage.</p>' +
    '<p>Saturday, December 26, 2026 · 2:30 PM<br><span style="opacity:.8">Minor Basilica of San Sebastian, Quiapo, Manila<br>Reception to follow at Champagne Room, The Manila Hotel</span></p>' +
    '<p style="font-size:12px;letter-spacing:3px;color:#4e0b12;margin-top:28px">YOUR INVITE CODE</p>' +
    '<div style="display:inline-block;background:#e7e2d8;border-radius:10px;padding:12px 28px;font-size:30px;letter-spacing:3px;color:#2e2622">' + code + '</div>' +
    '<p style="margin:28px 0"><a href="' + link + '" style="background:#202700;color:#f1eee7;text-decoration:none;border-radius:999px;padding:12px 32px;letter-spacing:3px">Open Your Invitation</a></p>' +
    '<p style="font-size:13px;opacity:.7">Or go to ' + SITE_URL.replace(/^https:\/\//, "").replace(/\/$/, "") + ' and enter your code.</p>' +
    '<p style="font-style:italic">Kindly reply by December 5, 2026.</p></div>' +
    '<div style="background:#40050c;color:#f1eee7;text-align:center;padding:24px"><div style="font-size:24px;font-style:italic">Anne &amp; Ryan</div>' +
    '<div style="font-size:11px;letter-spacing:2px;opacity:.8;margin-top:6px">THIS INVITATION IS FOR ' + party.toUpperCase() + ' · ' + seats + (seats === 1 ? ' SEAT' : ' SEATS') + '</div></div></div>';
}
function sendOne_(to, party, code, seats) {
  MailApp.sendEmail({ to: to, subject: "Anne & Ryan · Your invitation", name: "Anne & Ryan",
    htmlBody: inviteHtml_(party, code, seats),
    body: "Dear " + party + ",\n\nYou're invited to Anne and Ryan's wedding on Saturday, December 26, 2026.\nYour invite code: " + code + "\nOpen your invitation: " + SITE_URL + "invite.html?code=" + code + "\n\nKindly reply by December 5, 2026." });
}
function sendInvites() {
  const g = guestRows_(); const ps = parties_(g.rows); let sent = 0, skipped = [];
  Object.keys(ps).forEach(function (p) {
    const idx = ps[p];
    if (idx.some(function (i) { return g.rows[i][G.sent]; })) return;
    const email = idx.map(function (i) { return String(g.rows[i][G.email]).trim(); }).filter(String)[0];
    const code = g.rows[idx[0]][G.code];
    if (!email || !code) { skipped.push(p + (code ? " (no email)" : " (no code: run makeCodes)")); return; }
    sendOne_(email, p, code, idx.length);
    idx.forEach(function (i) { g.sh.getRange(i + 2, G.sent + 1).setValue(new Date()); });
    sent++;
  });
  Logger.log(sent + " invitations sent. Daily email quota left: " + MailApp.getRemainingDailyQuota() + (skipped.length ? "\nSkipped: " + skipped.join(", ") : ""));
}
function sendTestInvite() {
  sendOne_(Session.getActiveUser().getEmail(), "Santos Family", "AR-7K2QX9", 4);
}

/* site: log in with a code */
function login_(b) {
  Utilities.sleep(300);                                   // slows down guessing
  const code = normCode_(b.code); if (!code) throw new Error("nomatch");
  const g = guestRows_();
  const idx = []; g.rows.forEach(function (r, i) { if (String(r[G.code]).toUpperCase() === code && String(r[G.name]).trim()) idx.push(i); });
  if (!idx.length) throw new Error("nomatch");
  const first = g.rows[idx[0]];
  const table = idx.map(function (i) { return g.rows[i][G.table]; }).filter(String)[0] || "";
  const email = idx.map(function (i) { return String(g.rows[i][G.email]).trim(); }).filter(String)[0] || "";
  return { ok: true, party: {
    name: String(first[G.party]), code: code, table: String(table), email: email,
    replied: idx.some(function (i) { return g.rows[i][G.rsvp]; }),
    guests: idx.map(function (i) { const r = g.rows[i]; const plus = /^plus\s*one$/i.test(String(r[G.name]).trim());
      return { row: i + 2, name: plus ? String(r[G.plusName] || "") : String(r[G.name]), plusOne: plus,
               attending: r[G.rsvp] === "Joyfully accepts" ? "Yes" : r[G.rsvp] === "Respectfully declines" ? "No" : "", food: String(r[G.food] || "") }; })
  } };
}

/* site: forgot code → email it again */
function forgot_(b) {
  const email = String(b.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Please enter a valid email address.");
  const g = guestRows_(); const ps = parties_(g.rows);
  Object.keys(ps).forEach(function (p) {
    const idx = ps[p];
    if (!idx.some(function (i) { return String(g.rows[i][G.email]).trim().toLowerCase() === email; })) return;
    const code = g.rows[idx[0]][G.code];
    if (code) sendOne_(email, p, code, idx.length);
  });
  return { ok: true };                                     // same answer either way, so emails can't be probed
}

/* site: save one answer per guest */
function rsvpParty_(b) {
  if (b.website) return { ok: true };
  const code = normCode_(b.code); if (!code) throw new Error("Please log in again.");
  const g = guestRows_(); const now = new Date();
  const log = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), RSVP_SHEET, RSVP_HEAD);
  const email = clean_(b.email, 120);
  (Array.isArray(b.guests) ? b.guests : []).forEach(function (a) {
    const row = Number(a.row); const r = g.rows[row - 2];
    if (!r || String(r[G.code]).toUpperCase() !== code) return;      // only rows of this party
    const att = a.attending === "Yes" ? "Joyfully accepts" : a.attending === "No" ? "Respectfully declines" : "";
    if (!att) return;
    const food = att === "Joyfully accepts" ? clean_(a.food, 200) : "";
    const plus = /^plus\s*one$/i.test(String(r[G.name]).trim());
    const pname = plus ? clean_(a.name, 80) : "";
    if (hasBadWords_(food) || hasBadWords_(pname)) throw new Error("Some words aren't allowed here.");
    g.sh.getRange(row, G.rsvp + 1, 1, 3).setValues([[att, food, now]]);
    if (plus) g.sh.getRange(row, G.plusName + 1).setValue(pname);
    if (email && !String(r[G.email]).trim() && row === Number(b.guests[0].row)) g.sh.getRange(row, G.email + 1).setValue(email);
    log.appendRow([now, plus ? "Plus one of " + r[G.party] + ": " + pname : r[G.name], email, att === "Joyfully accepts" ? "Yes" : "No", food]);
  });
  return { ok: true };
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
      case "login": return json_(login_(body));
      case "forgot": return json_(forgot_(body));
      case "rsvp_party": lock.waitLock(10000); return json_(rsvpParty_(body));
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
