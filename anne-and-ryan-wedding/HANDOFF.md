# Handoff: Anne & Ryan wedding site

This file explains how the site was made, step by step, so you can rebuild it the same way or keep working on it.

- **Live site:** https://iamlura.github.io/anne-and-ryan-wedding/
- **Repo:** https://github.com/iamlura/anne-and-ryan-wedding
- **Figma:** https://www.figma.com/design/pAVTZMkGiY9VYrzp7IeVJO/Anne-wedding-website (page "final pages AC", node 224:2; older page "final pages" kept untouched)

## Start here: copy-paste prompt for the next chat

Paste everything in the box below into a new chat. GitHub is the only source of truth: no patches, no zips.

```
I'm continuing work on the Anne & Ryan wedding website.

- Repo (source of truth): https://github.com/iamlura/anne-and-ryan-wedding
  Site files are in the anne-and-ryan-wedding/ folder. Live: https://iamlura.github.io/anne-and-ryan-wedding/
- First: clone the repo and read anne-and-ryan-wedding/HANDOFF.md, starting with "Status", "Next steps" and section 0.
  Everything (design, Figma map, Apps Script, guest list steps, open questions) is in there.
- Figma: https://www.figma.com/design/pAVTZMkGiY9VYrzp7IeVJO/Anne-wedding-website (page "final pages AC", node 224:2)
- The ONE Google Sheet (guest list + invite codes + Guests + letters + RSVPs, Apps Script bound, "Wedding" menu):
  https://docs.google.com/spreadsheets/d/1HqWuWL7zTKcbcaN-sLxrb0pIZ7qdk8442e-J3aJzkgU/edit
  (Ryan's "Guest List for Wedding Website"; the old "Anne & Ryan wedding" Sheet is retired, see HANDOFF.md section 0.)
- I'm the designer (Laura). Anne is the bride; I relay her feedback.

How I like to work:
- Keep explanations brief.
- Every change goes into both Figma and the site. Update HANDOFF.md each round (Status, Next steps, section 0, change log).
- Figma: fix my original frames directly (no copies) and leave the yellow star where it is; don't delete my frames;
  name layers casually ("Frame", "Rectangle"); no empty spacer frames, use auto-layout padding / gap.
- Google Sheets: there is no Sheets editing connector; use my Chrome (Claude in Chrome) for Sheet edits.
- Ask before spending paid AI credits.
- Publishing: push the changes to main yourself. If git push is refused, upload through GitHub's web
  upload page in my Chrome (Claude in Chrome), one upload per folder, "Commit directly to main"
  (HANDOFF.md section 7). Never send me patches. Then check the live site.
```

## Status (updated Nov 19, 2026, 30th round)

| | |
|---|---|
| Site | 6 pages + invite page + the full message flow. **Nov 15: restyled to design "AC" (Anne's pick); RSVP now uses invite codes.** **Nov 16 (18th round): code login / RSVP are live** (backend moved into Ryan's Sheet, see section 0b). **Nov 17 (19th round): phone "RSVP sent" fixed.** **Nov 17 (20th round): invite codes removed, guests RSVP by searching their last name; desktop thank-you matches the designer's Figma** (section 0x). **Nov 17 (21st round): Our Story photos = one never-ending strip of all 22** (section 0a). **Nov 17 (22nd round): Anne's "Wedding Website Part II" comments applied, site + Figma** (section 0z). **Nov 18 (23rd round): Part III applied (story text, RSVP hint, FAQ plus one / children, olive pill "Write a Message", no strip under the message photo, PNG favicons for Safari, dusty rose envelope); domain www.ryannehara.com half set up** (section 0). **Nov 19 (24th round): flowers recoloured pink / red / deep rose to match the theme; custom domain saved, https://www.ryannehara.com works** (section 0, end). **Nov 19 (25th round): dietary requirements optional on the RSVP** (section 0, end). **Nov 19 (26th round): Anne's "Wedding Website Part 4" (no barong, please; cities on The Details; bank QR codes in the FAQ)** (section 0, end). **Nov 19 (28th round): designer's final Figma updates: nav shows on scroll up, lighter olive When / Where, pink Wedding Day card, "Collapse bank QR", Leave a Message = full photo + letters anywhere except over the text** (section 0, end). **Nov 19 (30th round): short phone pages fill the screen, Our Story phone order, centred countdowns, bank QR popup, faster last-name search** (section 0, end). |
| Data | **One Sheet since Nov 16:** Ryan's "Guest List for Wedding Website" holds the guest list, "Invite codes", Guests (RSVP answers), Messages (letters) and RSVP log, with the Apps Script bound to it (deployed by the designer's account, jaeyoung.laura@gmail.com). The old Sheet "Anne & Ryan wedding" + Google Form are no longer used (safe to trash once Anne is happy). Links in section 7. |
| Waiting on the designer | New content and some design changes are coming (the site is set up for this, see "Changing content" below). |
| Figma vs site | In sync as of Nov 15 (14th round: site re-checked against every AC frame, text and screenshots). **The reference is now page "final pages AC" (section 0c below).** The older frames in section 2 are still the reference for the Leave a Message flow and the secret inbox (only recoloured on the site). Phone frames for AC (Nov 16): **editable** layers ("… phone editable", "nav open phone") next to the earlier screenshot frames; both made from the live site at 390 wide (section 0c). Phones are built from the CSS in the ≤760px block. |
| Code changes since launch | **Nov 4:** type scale, landing updates, Event Details redesign, shared content file. **Nov 4 (2nd round):** matched the designer's own updated frames (Event Details, Our Story, RSVP, Leave a Message 7/8, landing prenup + footer); Dec 26 everywhere in Figma. **Nov 4 (3rd round):** one button style everywhere, guests can delete their own letter. **Nov 4 (4th round):** every footer = "Thank you" + RSVP button (nav links removed again), all carousel cards 440 wide with 400×600 photos, prenup photos link to the Our Story carousel, new green tuxedo photo. **Nov 8 (5th round):** all info matched to the printed invitation (2:30 PM, Minor Basilica of San Sebastian, reception at Champagne Room, RSVP by Dec 5), new dress code with color swatches, new Reception / Parking / Kindly Note / Gifts section. **Nov 8 (6th round):** invitation fonts undone (back to Afacad / Playfair / Carattere), Event Details background image removed. **Nov 8 (7th round):** story cards all the same height, RSVP sub-headings in Playfair, Google Form for RSVPs + Sheets connected for letters. **Nov 8 (8th round):** envelopes on the right half of the arch tilt the mirror way, guest delete removed. **Nov 8 (9th round):** on "Place your letter" the letter starts in the middle. **Nov 9 (10th round):** Anne's new AR monogram everywhere; Guests tab in the Sheet; draft Figma screens for guest login (invite code, party RSVP, email). **Nov 9 (11th round):** phone form text (RSVP + message inputs, radio answers) 32 → 24 px; "final pages" rearranged in flow order with two new screens (wrong code, RSVP sent). **Nov 12 (12th round):** Anne's doc: Cormorant Garamond + Pinyon Script, burgundy / olive / cream, new landing (When / Where, countdown, new message, RSVP footer), story text, "The Details" redesign, new FAQ page. **Nov 15 (13th round):** design AC everywhere + Anne's mashup notes, RSVP by invite code (one answer per guest). **Nov 15 (14th round):** matched the designer's Figma updates: new arch photo, hero crop, two olives, pink Wedding Day card, timeline lines. **Nov 15 (15th round):** no overscroll; FAQ hero crop + photo card matched to Figma. **Nov 16 (16th round):** new nav (monogram left, links right), Anne's new dress code + 5 swatches, RSVP → code → RSVP with no stray page, "We have reserved N seats for you." layout, editable phone frames. **Nov 16 (17th round):** nav on the code page (invite.html), solid phone menu, invite codes for Anne's new list. **Nov 16 (18th round):** one Sheet (Ryan's), Wedding menu, chat messages. **Nov 17 (19th round):** phone RSVP sent screen. **Nov 17 (20th round):** RSVP by last name (no codes), desktop thank-you = Figma 227:411. Details in section 9. |


### Next steps (as of Nov 19, 30th round)
14. **FAQ banner on phones (designer, Nov 19: "can't see the banner image"):** not reproduced (shows in Chrome and in WebKit / iPhone 13 emulation, and on the live page). Phones now get a lighter copy `faq-hero-phone.jpg` (900 wide, baseline JPEG, 150 KB) through `<picture>`. If she still can't see it, ask which phone / browser and for a screenshot.
15. ~~QR default~~ (superseded in round 30: the link now opens a popup) (designer, Nov 19, round 29): the codes **start collapsed**: the link reads "Show bank QR" (chevron pointing down); tapping it opens them and it turns into "Collapse bank QR" (Figma 287:13 shows the open state; white note under FAQ AC says so). Site: `hidden` on `#bankQr`, `aria-expanded="false"` in `faq.html`.
1. ~~Rounds 12 + 13 in the repo~~ (done Nov 15).
2. ~~Backend with codes~~ (done Nov 16: Code.gs in Ryan's Sheet, `setupAll` run, web app deployed, `config.js` points at it; login tested with AR-FBXQ65).
3. ~~Guests tab~~ (done: filled from "Invite codes" by `setupAll`, 54 invitations / 81 rows, codes in column J). No CSV import needed any more.
4. Share the Sheet with Anne (Editor) if she isn't on it yet, so she can use the **Wedding** menu.
5. Sending invitations (Anne / Ryan): **chat** = "Invite codes" tab, column H (Message: now just the RSVP link + "search your last name", no code) to copy, column I (Send on WhatsApp). **Email** = guest emails in Guests column C, then Wedding > Send a test invite to me, then Wedding > Send invites by email (the email has an RSVP button, no code).
6. Later: table numbers in Guests column H. Then trash the old Sheet "Anne & Ryan wedding" + its Form.
7. ~~Phone "RSVP sent"~~ (done Nov 17, round 19, designer picked all 3 fixes): card moved down so the couple shows above it, even 40 px card padding, button "Leave Anne & Ryan a message" on one line. Site: `style.css` ≤760px block (`.rsvp:has(.rsvp-done.is-active)` rules + `.rsvp-done .pill-btn`). Figma: **"RSVP sent logged in phone editable" (244:564)** fixed directly (photo 412 → 584 tall, card 244:568 now auto-layout at y 220, button 244:571 auto-layout hugging, frame 878 → 1050). Still old: the screenshot frame "RSVP sent logged in phone" (233:18), refresh it from the live site.
8. ~~Our Story: more photos~~ (done Nov 17, round 21: all 22 in a never-ending strip, section 0a).
10. ~~Part II comments~~ (done Nov 17, round 22, section 0z). Open from it: photo **#92** wasn't in Anne's Drive folder, so the gallery uses the copy pasted in her doc (1501×1999, fine on screen); swap in the original if she adds it. Photo **#34** not used (she said only if it fits after the 4 story pictures; the 2×2 already matches the text height). The phone screenshot frames (233:xx) are not refreshed.
11. **Domain www.ryannehara.com:** the designer saved the custom domain in GitHub on Nov 19 ("DNS check successful"), and **https://www.ryannehara.com works.** Still to do: (a) the designer deletes Namecheap's "URL Redirect Record" (@ → http://www.ryannehara.com/). Until then the bare **ryannehara.com** sometimes lands on Namecheap's redirect server (192.64.119.163), which has no HTTPS, so Chrome shows "This site doesn't support a secure connection". (b) Tick **Enforce HTTPS** in Settings > Pages (available now, waiting on the designer's OK). (c) Then set `SITE_URL` in Code.gs to https://www.ryannehara.com/, deploy a new version (same URL), run Wedding > Add chat messages, and check the bare domain redirects to https://www. **Nov 19:** the designer's own Namecheap account (laupark99) has no domains: ryannehara.com is registered in another account (Anne's / a friend's). For (a), the owner either deletes the URL Redirect Record themselves (Domain List > Manage > Advanced DNS) or shares the domain with laupark99 (Manage > Sharing & Transfer > Share Access, Advanced DNS rights); it then shows in laupark99's Domain List. **Plan (designer, Nov 19):** the designer sent Anne the Share Access steps (Manage → Sharing & Transfer → Share Access → New Manager **laupark99** → "Give manager some permissions" → all of Advanced DNS → password → Confirm). The designer then clicks the confirmation link in Namecheap's email. **Done Nov 19 (round 27):** Anne shared ryannehara.com; the designer added the primary address Namecheap asks for, and the invite was accepted (domain now in laupark99's Domain List). Advanced DNS already had NO URL Redirect Record (Anne removed it): only the 4 GitHub A records on @, CNAME www → iamlura.github.io., plus Namecheap's locked email TXT; Redirect Domain is empty. http://ryannehara.com now gets a GitHub 301 to www. GitHub Pages settings: DNS check successful, "Detected a change to DNS settings. Requesting a new certificate"; Enforce HTTPS greyed out until the certificate is issued (minutes to about an hour). **Still to do:** tick Enforce HTTPS once it's clickable (ask the designer first), then (c). ~~Old plan:~~ **Next chat, once she says it's shared:** in the designer's Chrome, Namecheap → Domain List → ryannehara.com → Manage → Advanced DNS → delete only the "URL Redirect Record" (keep the GitHub A / CNAME records) → check http://ryannehara.com ends on https://www.ryannehara.com → ask the designer, then tick Enforce HTTPS (repo Settings > Pages) → then (c).
13. **Anne's new guests (Nov 19):** Anne will add forgotten guests to Ryan's list, marked with yellow cells. Adding them there alone does nothing for the RSVP: each new invitation also needs a row in "Invite codes" with a new `AR-` code (section 0b), then Wedding > Add new invitations to Guests. Do this through Chrome once she's done. **Added Nov 19:** Julius Manzanilla and Embong Manzanilla (AR-VQ8T7K) and Jon Rivera and Fe Rivera (AR-YSPW5K), both Anne · Extended Fam, 2 seats: Invite codes rows 56–57, Guests filled by the menu (56 invitations / 85 guest rows now), live search finds both. Typing tip: in Sheets, type each cell and press Tab (pasting tab-separated text puts it all in one cell).
12. **Anne's test RSVP:** Anne and Ryan will submit one test RSVP. Afterwards clear it in the Sheet (Guests tab: that party's answer cells; RSVP log: the test row) through Chrome.
9. ~~RSVP by last name, thank-you to Figma~~ (done Nov 17, round 20, section 0x). Still to do: phone frames for the search steps (find / not found / pick) don't exist in Figma yet; the "invite code" rows in Figma are now unused (noted, not deleted). FAQ "Can I bring a plus one?" says guests "search" on the RSVP page, which is true again.

**Invite codes (Nov 16; since Nov 17 only an internal id, guests never see them):** one per invitation, `AR-` + 6 characters from `CODE_CHARS` (no 0/O, 1/I/L), made by `tools/anne_list_to_guests.py` (re-running keeps the codes of invitations already in guests_import.csv). Listed in Ryan's Sheet "Guest List for Wedding Website", tab **"Invite codes"** (Side, Group, Invitation, Guests, Seats, Invite code, Invite link), added through Chrome (the Drive connector can only view that Sheet). Anne's Nov 16 list: Catherine Ramirez's party is now "Catherine Ramirez, Lennon Ramirez, and Bel Ramirez" (3 seats); every listed seat count matches its names.

---

## 0. Nov 18 (round 23): Anne's "Wedding Website Part III"

| Item | Site | Figma |
|---|---|---|
| Our Story text (both paragraphs) | `story.html` | 216:82 / 216:83, phone 244:142 / 244:143 |
| RSVP hint "Enter your last name only.", placeholder "Zamora" | `rsvp.html`, not-found text in `rsvp.js` | 218:285, 218:284, not found 218:53 |
| FAQ plus one + children answers | `faq.html` | 216:220 / 216:224, phone 244:240 / 244:243 (phone items below moved down 54) |
| "Write a Message" = olive pill like the RSVP buttons | `.btn--pill-olive` in `style.css`, `message.html` | 216:7652, phone 244:270 (fill = 218:287, radius 999, stroke removed) |
| No cream strip under the message photo (desktop) | `.stage-wrap:has(.arch--photo)`: auto height, stage relative | already full height (275:54) |
| Old monogram in Safari tabs | `favicon-32.png` + `apple-touch-icon.png` (from `favicon.svg`), linked with `?v=3` on all 6 pages. Safari ignores SVG favicons | n/a |
| Dusty rose envelope (Anne's chat) | `env-body.svg` #DDBDC0, `env-flap.svg` #B8878D, `--lav` / `--lav-dark` | all 64 lavender fills on page 224:2 recoloured |
| Domain | see Next steps 11 | n/a |


**Nov 19 (round 24): flowers to the theme colours (designer's request)**

| Item | Site | Figma |
|---|---|---|
| Flower 1 = soft pink, flower 2 = red, flower 3 = deep rose; olive leaves + black lines kept | `flower-1/2/3.png` recoloured (purple pixels only: hue 348 / 354 / 352, more saturation for 2 and 3), linked with `?v=2` in `notes.js` and `message.html`; palette labels now pink / red / rose | "Leave a Message AC": Group 806 (pink), Group 807 (red), both flower-3 groups 216:7842 / 216:7979 (deep rose). Same colour transform, so site and Figma match. No lavender left on page 224:2 |

**Nov 19 (round 25): dietary requirements optional (Anne: John couldn't submit with it empty)**

| Item | Site | Figma |
|---|---|---|
| Submit works with dietary empty; only the accept / decline answer (and an accepting plus one's name) is required | `complete()` in `rsvp.js`; placeholder "Allergies, or “none”" → "Optional, e.g. allergies"; `rsvp.js?v=2` in `rsvp.html`; test leaves it empty | no change: the RSVP frames show filled sample answers ("None", "Vegetarian"), not the placeholder |

Code.gs already accepted an empty dietary answer, so no new deployment was needed.

**Nov 19 (round 26): Anne's "Wedding Website Part 4"** (Google Doc docs.google.com/document/d/1TV1gh_M3qNASAslLVYeJWUEdJ20Tb_tRDJase9ieBnM, shared by link; `export?format=zip` downloads it with its images)

| Comment | Site | Figma (originals fixed) |
|---|---|---|
| Dress code "(no barong, please)" | `details.html` | 216:167, 227:293, phone 244:202, 244:502 |
| "Quiapo, Manila" / "Ermita, Manila" under Ceremony / Reception on The Details (like the landing) | `<p class="city" data-c="venueCity/receptionCity">` in `details.html` `.d-facts`; `.d-facts .city` 28 (phone 16), opacity .8 | desktop texts 286:2–286:5 in 216:124 / 216:128 / 227:250 / 227:254 (auto-layout, 28, 80%); phone texts under the values in 244:169 and 244:466 (16, 80%), layers below + following sections moved down 25 each, frames grown |
| Bank QR codes under "Do you have a gift registry?", small | `qr-gcash.jpg` (GCash screenshot cropped above the empty blue bottom) + `qr-bpi.jpg`, both 640 wide q90, from the full-size images Anne sent in chat; `.faq__qr` in `faq.html`: two codes side by side, 260 tall (phone 170), each links to the full image (tap to open / save). Checked with a QR decoder: same payload as Anne's originals | "Frame" 286:10 (horizontal auto-layout, gap 30, top padding 10) with 2 "Rectangle"s 286:11 / 286:12 (158×260 / 244×260, radius 12) in 216:230; phone 286:13 / 286:14 (103×170 / 160×170, radius 8) under 244:249 |

Not refreshed: phone screenshot frames (233:xx).

**Nov 19 (round 28): designer's final Figma updates + requests** ("check figma for final design updates and update the website accordingly")

Found by screenshotting every "final pages AC" frame (desktop + phone editable) against the site at 1920 / 390:

| Change | Site | Figma |
|---|---|---|
| Nav: hides while scrolling down, comes back on scroll up, every page, desktop + phone (designer's request) | `.nav` is `position: sticky; top: 0` + `.nav--hidden { transform: translateY(-100%) }`; `common.js` toggles it (always shown within one nav height of the top, shown when a nav link gets keyboard focus, ignored while the menu / inbox locks scrolling). Tested in Chromium + WebKit | white note 293:5 under the landing |
| When / Where band back to the lighter olive #2c330a (Figma 216:27); church / reception names 38 (line 1.15), cities 30 at 85% | `.ww` uses `--olive-2`; `.ww .name` / `.ww .city` | designer changed 216:27; same fill now on welcome 227:186, phones 244:32, 244:427, nav open 248:37 |
| The Wedding Day card pink again (#ecded9), burgundy #40050c text / dots, title 60%, one line through all dots (Figma 287:977) | `.d-day__card`, `.d-day h2`, `.schedule::before` (desktop left 267.5 / top 56 / bottom 52; phone left 112 / 26 / 26), dots `currentColor`; the old per-dot line pieces removed | designer rebuilt 216:108 / 227:258 / 244:479; phone 244:179 recoloured to match |
| FAQ: chevron + "Collapse bank QR" under the codes (Figma 287:13: 28 px, 50%, underlined, 10 gap) | `<button class="qr-toggle" data-qr-toggle aria-controls="bankQr">` in `faq.html`, `.qr-toggle` CSS (phone 18 px), toggle in `common.js` (open by default; collapsed = "Show bank QR", chevron flips) | phone copy 293:2 under the codes in 244:229 |
| FAQ banner on phones | `<picture>` with `faq-hero-phone.jpg` for ≤760 px (see Next steps 14) | n/a |
| Leave a Message (Figma 216:302 / phone 244:266): photo stage 1920 × 1800 (phone 390 × 730, photo 848 wide centred), copy block 640 from the stage top (phone 308), 36 between heading / text / button (phone 23), text 620 wide line 1.45, cream copy over the photo on phones too | `.stage-wrap:has(.arch--photo)` rules (desktop) + the ≤760 block; `.stage-copy` lets taps through except heading + button | designer's frames (no change) |
| **Letters anywhere on the page except over the copy block (Frame 3231)** (designer's request) | `notes.js` → `Notes.free`: `nearestSpot` (grid rings, step w/6) finds the closest spot whose letter box (±0.3w, −0.36w / +0.22w around the centre, room for the tilt) stays inside the photo, clear of the copy block (+3% pad) and of earlier letters (ellipse 0.56w × 0.5w); if the photo is full, letters may overlap each other but never the copy. `pack` places everyone in time order (deterministic per screen size). `message.js`: drag (grab point stays under the finger, faded while over the text), tap anywhere on the photo, or arrow keys; on drop it snaps to the nearest free spot; Send stays at 50% until placed. Letter size = Figma (13% of the stage on desktop, 33% on phones). Tilt mirrored left / right as before. Place-step copy: "Place your letter anywhere on the photo and leave it for Anne and Ryan to read soon!"; toast "Your letter is up for Anne and Ryan. Thank you!" | white note 293:6 under Leave a Message AC |

**How a spot is saved (no Apps Script change):** the backend still stores one `pos` number (0..1). New letters pack x / y (fractions of the stage) into it: `pos = (round(x·999)·10000 + round(y·999)·10 + 7) / 1e7` (last digit 7 = new format; `encodeXY` / `decodePos` in `notes.js`). Older letters (4-decimal arch positions, e.g. the designer's test letter 0.7114) are shown where their arch point was. Code.gs, the Sheet and the deployment are unchanged.

Cache: `style.css`, `common.js`, `notes.js`, `message.js` linked with `?v=28` on every page. Tests: `tools/test_message_flow.py` now drops the letter right on the copy block and checks it snapped off (desktop 1440 + phone 390: 0 envelopes over the text).

**Nov 19 (round 30): designer's requests**

| Request | Site | Figma |
|---|---|---|
| Phone pages with little content: photo at least one screen tall, footer only after scrolling | ≤760: `.rsvp { min-height: calc(100vh - 64px); align-items: flex-start }` (find / not found / pick / thank-you; the long party step just grows), message stage `min-height: calc(100vh - 64px)` (letters use stage fractions, so they follow) | RSVP sent phone 244:564 + Leave a Message phone 244:264: photo sections 780 tall (844 − 64 nav), footers moved down; white note 296:2 |
| Our Story on phones: title, the 4 photos, then the text (designer's Figma 244:140) | ≤760: `.story-top__text { display: contents }` + `order` on h1 / `.story-pics` / `.story-text`, gaps 23 / 40 | designer's frame |
| Photo strip moving on phones | already drifts (float position); phones 22 → 30 px/s, `touchcancel` also resumes it (iOS cancels touches when the page scrolls). Still pauses for "reduce motion" | n/a |
| Countdown centred: desktop 120 above / below (designer's welcome 227:205), phone 164 tall, numbers centred, 21 between columns, 7 between number and label (welcome phone 244:440) | `.countdown` padding 120 (phone 52 / 20), `.countdown__nums` no top padding, phone gap 21, label gap 7 | landing 216:46 = 227:205 (padding 120, inner padding 0); landing phone 244:45 + nav open 248:50 numbers / labels moved down 20 |
| Bank QR: popup with an X; tapping the dark overlay goes back to the FAQ | `faq.html`: "Show bank QR" button (`data-qr-open`, chevron pointing down) + `#qrPop` dialog after the footer (overlay 82% black, GCash + BPI codes side by side, 70vh tall; stacked 80vw on phones, scrolls); `common.js`: open / close on X, overlay (anything but the codes), Esc; body scroll locked; focus to X and back. The codes are no longer links to the raw image (that opened a bare black page) | FAQ AC: QR row 286:10 hidden, link 287:13 = "Show bank QR" (chevron 180°); phone: codes 286:13/14 hidden, link 293:2 moved up; note 294:2 describes the popup |
| Faster last-name search | measured live: every Apps Script call ≈ 2–2.6 s; one match used two calls (find + login ≈ 5 s). Now `find_` also returns each invitation's details (up to 12 matches, via `partyOf_`, shared with `login_`; `login_` lost its 300 ms sleep) → **one call**. `rsvp.js` starts searching 450 ms after the guest stops typing (≥ 3 letters) and reuses that request on submit; `WeddingAPI.ping()` wakes the script when the RSVP page opens; results cached per name, cleared after an RSVP is sent. Falls back to `login` if the backend is older. Mock backend returns the same; RSVP test shows no login call | n/a |

**Code.gs changed (round 30):** deployed as **web app version 4** (Nov 19, 10:55 PM, same URL / deployment "wedding site"), pasted with the monaco + raw GitHub method in section 7 (editor content checked against the previous commit first, SHA-256 of the pasted file = GitHub). Live timings after: search with a pause after typing → results in ~30 ms (prefetched); pressing Find straight away → ~2.4 s (was ~5 s: find + login); picking from several invitations → instant (was another ~2.5 s).

Cache: `style.css`, `common.js`, `api.js`, `rsvp.js`, `moments.js` linked with `?v=30`.

Not changed: the older page "final pages" (kept untouched; its Leave a Message flow frames and source flower groups 87:111843 / 87:111937 / 87:112031 are still lavender). The recolour script is `tools/flower_recolor.py` (run on the lavender originals in git history, before commit "Flowers pink/red").

---

## 0z. Nov 17 (round 22): Anne's "Wedding Website Part II" comments

Source: Google Doc "Wedding Website Part 2" (Ryan's, docs.google.com/document/d/1soICeiC1Vjnd2dtqkfi4BZ_GLiJ_Vh2dKnstU08Eo5s) + Anne's Drive folder "Additional Photos - Wedding Website" (1M9ApF-LimDI6Din2-IUmmEhxtpnG0A_r, shared by link, subfolder "Gallery Photos"). The files download straight into the sandbox with `curl -L "https://drive.usercontent.google.com/download?id=<id>&export=download"`; the doc's own screenshots come with `.../export?format=zip`. Web copies made with PIL (heroes 1400 wide q78, others 900 / 700 / 1100 tall).

| Comment | Site | Figma (originals fixed) |
|---|---|---|
| Main picture → #59 | `hero-garden.jpg`, `object-position: 50% 55%` (couple above the logo) | 216:12 / 227:153 (top rect, keeps the black veil), phones 244:5 / 244:397 |
| Logo frame from Canva p3 | `monogram-pill.svg` rebuilt: capsule, 6 px outer + 2.4 px inner line, AR letters (geometry measured from the doc's Canva screenshot, 360×594); `.monogram` 94×155 (phone 54×89) | old "Group 71" hidden, capsule "Frame" added in 217:2, 227:154, 244:6, 244:399 |
| Date → "– 12.26.26 –" | hero line is plain text now (no `data-c`) | 216:13, 227:172, 244:24, 244:417 |
| "With love," not italic | `.couple-msg__text .with` | 216:21, 227:179, 244:29, 244:424 |
| Couple photo → #50 | `arch-photo-50.jpg` | 217:19, 227:185, 244:31, 244:426 |
| When / Where on the darker olive | `.ww` = `--olive` (#202700) | bands 216:27, 227:186, 244:32, 244:427 |
| "Where" aligned with "When" | `.ww__row { align-items: flex-start }` (desktop; phone is stacked anyway) | rows 216:28, 227:187 counter-axis top |
| Ceremony lines = city size | `.ww__lines p:not(.big)` 28 (phone 18) | 32 → 28 / 20 → 18 |
| Our Story: 4 pictures | `.story-pics`: 2×2 small polaroids (night out, graduation, ring in Hokkaido, Dandi & Pami) replace the single polaroid; `story-pair-1..4.jpg` | old polaroid hidden; "Frame" grid 275:2 (desktop), 275:11 (phone) |
| Gallery: swap 7 | story-13 → #1, story-2 → #103, story-11 → #56, story-22 → #31, moment-2 → #13, moment-5 → #144, story-9 → #134 (matched by image against the doc's screenshots) | same swaps in 216:86 and phone strip 244:146 |
| Gallery: add 10 | #9, 20, 21, 22, 37, 42, 108, 112, 91, 92 at the end (32 photos now, `gallery-N.jpg`) | 10 more columns / rects |
| Details: drop the date under the title | removed from `details.html` | 216:118, 227:244, 244:168, 244:465 hidden |
| Wedding Day card → dark olive | `.d-day__card` olive, cream text / dots / lines | cards 216:132, 227:258, 244:179, 244:479 |
| Dress code → #76, arch | `<img class="dress-arch">` (top-rounded, 536×740), no polaroid | polaroid hidden, arch rect 275:50–53 |
| RSVP background → #96 | `rsvp-bg-96.jpg`, `object-position: 50% 42%` (couple just under the card, fully under it on the thank-you) | all 11 RSVP frames |
| Big "RSVP" → Cormorant caps | `.rsvp__card:not(:has(.rsvp-done.is-active)) h1` (112 / phone 52); "Thank you!" stays script | title texts in the RSVP frames |
| New RSVP intro copy | `rsvp.html` find step (uses `rsvpByLong`) | intro texts |
| FAQ questions in Cormorant, no photo, centred | `.faq__item h2` serif 40 (phone 24); polaroid removed; list centred | 216:192 (polaroid column hidden, texts Fill + centred), 244:223 (restacked) |
| Leave a Message: #51 instead of the flower frame | `message-bg.jpg` in both stages (home + place your letter), olive veil, cream copy on desktop (phone copy sits above the photo) | 216:302: flower group hidden, photo + veil rect 275:54, cream copy; phone 244:267 |
| Old monogram in browser tabs | favicon link is now `favicon.svg?v=2` on every page (the file was already the new AR; browsers had cached the old one) | n/a |

Publishing this round: `mcp__claude-in-chrome__file_upload` can put sandbox files straight into GitHub's upload page file input (≤3.8 MB per call), so images upload too (see section 7).

## 0x. Nov 17 (round 20): RSVP by last name, no invite codes

Designer's request: remove the guest code, make the RSVP searchable by last name, and make the thank-you page match her Figma frame.

- **Site flow** (`rsvp.html`, `assets/js/rsvp.js`): **find** (Last Name field, "Find my invitation") → no match: pink outline + "We couldn't find that name…" → one match: opens it → several matches (e.g. Zamora = 8, Hara = 4): **pick** list of invitation names + "Search again" → **party** (Anne's Nov 16 layout, unchanged, + "Not you? Search again") → **done**. The picked invitation is saved in the browser (`ar_guest`, as before), so the landing welcome and "Your Table" still work, and coming back to RSVP reopens it (answers filled in).
- **Matching** (`find_` in Code.gs): a guest's last word, a part of a hyphenated name (Suzuki-Cano → "Cano" / "Suzuki"), or a two-word last name ("Dela Cruz"); accents and case ignored (Español = espanol, Diño = dino); "Plus One" rows never match; at least 2 letters. Returns only invitation names + ids. Tested on the real Guests tab (all parties found).
- **Codes** stay in Guests column J / "Invite codes" as the party id between site and script (`find` → `login(id)` → `rsvp_party(id)`), so nothing in the Sheet had to change. `forgot` action removed. `invite.html` is now only a redirect to `rsvp.html` (old links keep working); `assets/js/invite.js` deleted; RSVP links no longer go to invite.html.
- **Invitations:** email (`inviteHtml_`) and chat Message column now say "RSVP … (search your last name): …/rsvp.html", no code. Deployed Nov 17 (web app version 3, description "wedding site", same URL) and Wedding > Add chat messages to Invite codes was run, so column H already has the new text. Live check: find "Zamora" returns the 8 invitations, "espanol" finds the Español party.
- **Thank-you (desktop)** = designer's "RSVP sent logged in" 227:411: photo section 1690 tall (card centred, 524 above/below), photo `object-position: 50% 13.3%` (= Figma image crop), title centred (phone too, like 244:564), text 30, button 40 below the text with 120 side padding. CSS: `@media (min-width: 761px)` block after `.rsvp-done p` in `style.css`.
- **Figma (originals fixed, no copies):** "RSVP AC" 216:247 label "Last Name", placeholder "Doe", hint "Type your last name…"; "RSVP AC not found" 218:2 the same + new error text; "RSVP AC sent" 218:231 matched to 227:411 (section padding 524, same image crop). **New frame "RSVP AC pick" 262:2** (14702, 2400, under "not found"). White notes: 262:54 (flow, under RSVP AC), 262:55 (party step = 227:322 / 240:172), 262:56 (above the invite code row: not used since Nov 17). Yellow star not moved.
- **Centred headers (designer, Nov 17, same round):** the script "RSVP" title and the party name are centred on every RSVP step, desktop and phone (body text stays left). CSS: `.rsvp__card h1` and `.party-title` get `text-align: center`. Figma: those texts set to Fill width + centre in 216:247, 218:2, 262:2, 218:57, 218:140, 227:322, 240:172 and phone 244:523.
- **Tests:** `tools/test_rsvp_flow.py [width]` (not found, pick, one match, answer, thank-you, reload, old invite link); mock backend has `find` + a second Zamora. `tools/test_invite_flow.py` removed.

## 0a. Nov 17 (round 21): Our Story photos, one never-ending strip

Designer: horizontal scroll, then "put all the photos and make it revolving so never ending scroll". **Live.**
- **Site:** `story.html` `.moments` → `.moments__track` with all 22 photos (moment-1…5, then story-1, 13, 3, 6, 8, 7, 19, 14, 2, 12, 5, 20, 11, 15, 9, 22, 10). Sizes + stagger repeat every 5 (`m1`–`m5`, same as before: 300×440, 260×360 +140, 320×480 +40, 260×340 +180, 300×420 +60; phones half size via `--u`). `assets/js/moments.js` copies the set once (copies `aria-hidden`), drifts the strip left (34 px/s desktop, 22 px/s phone) and jumps back by exactly one set when it passes it, so it never ends; guests can also swipe, trackpad-scroll or mouse-drag it either way (it loops both ways). Pauses on hover / touch / drag, resumes 1.5 s after a swipe; no drifting with "reduce motion". Gaps are `margin-right` on each photo (not flex gap) so both halves are equal. Scrollbar hidden. Old phone scroll-snap removed.
- **Figma:** "Our Story AC" 216:71, row "Frame 3041" 216:86 = 22 staggered columns (5 originals + "Frame" 269:2–269:11, 270:2–270:14), left padding 120, clips, prototype overflow horizontal scroll. Phone "Our Story phone editable" strip 244:146 has the same 22 (268:2–268:11, 270:16–270:22). White note 268:12. Figma can't show the motion; the note says it. "Our Story phone" 233:23 (screenshot) not updated.
- **Image hashes:** old "final pages" carousel 87:64564 card N = story-N (matched against assets/img). Moments = cards 4, 21, 16, 17, 18.
- story-9 is also the polaroid and story-11 the RSVP background; the designer asked for all photos, so they're in the strip too.

## 0b. Nov 16: one Sheet for everything

The designer asked to merge the two Sheets. The backend now lives in **Ryan's Sheet "Guest List for Wedding Website"** (link in section 7). Tabs: `Guest List for Wedding Website` (Anne + Ryan's list, theirs), `Guests` (one row per guest: codes, emails, RSVP answers, table), `How to fill`, `Invite codes` (one row per invitation + Message + Send on WhatsApp), `Messages` (letters; the 1 letter from the old Sheet was copied), `RSVP` (log, made on the first RSVP).

- **Apps Script project "Anne & Ryan wedding backend"**, bound to that Sheet, deployed as a web app (Execute as: the designer, Anyone). Emails sent from the menu go from **whoever clicks** (they approve Google's prompt once).
- `setupAll` (safe to re-run) = Guests + How to fill tabs, Messages tab, inbox password, `fillGuests` (adds every invitation from "Invite codes" whose code isn't on Guests yet), `importOldMessages` (letters from the old Sheet, skips ids it has), `addChatMessages`.
- **New invitations later:** add a row to "Invite codes" (with a new `AR-` code: 6 characters from `CODE_CHARS`), then Wedding > Add new invitations to Guests. Existing Guests rows are never touched.
- **Sending the codes** ("Wedding" menu in the Sheet, made by `onOpen`):
  - Send a test invite to me: the invite email (sample Santos Family) to the person clicking.
  - Send invites by email: asks "Send N invitation emails from <you>?", then emails every invitation with an email in Guests column C and no "Invite sent" date. Skips ones without email. Gmail limit ~100 a day.
  - Chat: "Invite codes" column H **Message** = ready-to-paste text ("Hi <names>! … We have reserved N seats … Open your invitation and RSVP by December 5: <link> (invite code …)"), column I **Send on WhatsApp** opens WhatsApp with it filled in (`wa.me/?text=`). Both are formulas (`addChatMessages`), so they follow edits to the row. Messenger / Viber: copy column H.
- The old `setup` / Google Form are not used; don't run `setup` in this project.

## 0c. Nov 15: design AC + invite codes

Anne chose the burgundy / olive "AC" design (a mix of directions A and C) and sent a mashup with 6 notes. The designer then made her own edits and chose **invite codes** for the RSVP (not name search). Everything below is built in Figma and on the site.

### Figma: page "final pages AC" (224:2), the reference for the whole site

Row 1 (y 0), left to right: landing 216:2 · Our Story 216:71 · The Details 216:108 · FAQ 216:192 · RSVP find-by-name 216:247 / not found 218:2 / party 218:57 / plus one 218:140 / sent 218:231 (these 5 are the earlier name-search idea, **superseded by row 2**) · Leave a Message 216:294. Big yellow star 218:289.

Row 2 (y 6500), the invite-code flow: invite email 227:2 · invite code 227:40 · wrong code 227:66 · forgot 227:93 · code sent 227:119 · welcome 227:143 · The Details logged in 227:234 · RSVP logged in 227:322 · RSVP sent logged in 227:411.

Phone frames (Nov 16), screenshots of the live site at 390 wide (2x), each an auto-layout frame of 1-2 image slices ("Rectangle"), with a white label on the left like row 2's:
- Row 3 (y 11036), straight under row 2: invite code phone 233:2 · wrong 233:4 · forgot 233:6 · sent 233:8 · welcome phone 233:10 · The Details logged in phone 233:13 · RSVP logged in phone 233:16 · RSVP sent logged in phone 233:18. (No phone frame for the invite email: mail apps lay it out.)
- Row 4 (y 14783), phones for row 1, in the same columns as their desktop frames (there is no room between row 1 and row 2): landing page phone 233:20 · Our Story phone 233:23 · The Details phone 233:26 · FAQ phone 233:29 · Leave a Message phone 233:32.
- To refresh them after site changes: take full-page screenshots at 390 x 844, scale 2 (logged-in states via the mock backend, code AR-7K2QX9), split into slices of at most 4000px, upload into the same rectangles. (Refreshed Nov 16 with the new nav, dress code and RSVP.)

**Editable phone frames (Nov 16)**: real layers (text, "image" rectangles, "Frame" boxes, the two monograms copied from this file), 490px right of each screenshot frame: landing page phone editable 244:2 · **nav open phone 248:7** (menu open) · Our Story 244:138 · The Details 244:164 · FAQ 244:223 · Leave a Message 244:264 (row 4); invite code 248:79 · wrong 248:111 · forgot 248:144 · sent 248:176 · welcome 244:394 · The Details logged in 244:461 · RSVP logged in 244:523 · RSVP sent 244:564 (row 3). Layers are absolutely placed inside section frames (no auto-layout). Made by measuring the live phone pages: `tools/figma_phone/` (README there explains how to redo it).

**Nov 16 desktop changes (made in the original frames, no copies):** Anne's nav ("Frame 3000": monogram left, links right, 60 padding, `#390007`, 1px bottom border `#4E0B12` 20%) copied onto all 16 desktop nav bars; dress code text + 5 swatches on The Details AC 216:108 and The Details logged in 227:234; RSVP logged in 227:322 lost "Your invitation" and the numbering, sub line = "We have reserved 4 seats for you."; new frame **RSVP logged in one seat 240:172** (row 2, x 20960) for Anne's case B (no name heading for a party of one). **17th round:** the 4 invite code desktop frames (227:40 / 66 / 93 / 119) got the nav (copy of 216:3, absolute at the top) + 110 top padding; the phone code frames and "nav open phone" were rebuilt from the site (solid menu, all links 100%).

Left of the landing: Anne's 6 notes as white annotation text (226:2–226:13) and her screenshots (228:2 notes, 228:3 mashup, 228:4 "we still love the burgundy-olive one"). Left of the RSVP frames: her guest-list message (226:14 text, 228:5 screenshot). The pre-notes AC row is still on "final pages" (193:2 …), untouched. Desktop frames only (1920). Phones use the ≤760px CSS.

### Anne's 6 notes (Nov 15)
1. Hero: AR monogram in the old pill frame on top, "Anne & Ryan", "December 26, 2026" below (venue line removed). `assets/img/monogram-pill.svg` (export of Figma 217:2).
2. "To our dearest friends and family" (was "family and friends,").
3. One arch photo of them looking at each other (`arch-photo.jpg` since round 14, cropped exactly like Figma 217:19). The RSVP background is still `couple-arch.jpg` (same image as Figma 227:331).
4. Countdown under When / Where, same olive, smaller (88 / 18, was 120 / 22), thin line between.
5. One green: dark olive `#202700` (her "2").
6. Footer "RSVP" in Cormorant Garamond caps (112, 4% tracking), every page.

### Designer's edits after that (Nov 15)
- Buttons inside the RSVP card and the invite email: olive `#202700` (`.pill-btn--olive`). Buttons on the photo gate stay rose `#915354`.
- Answer pills (Joyfully accepts / Respectfully declines): rose outline, rose fill when picked.

### Tokens (AC)
Page `#f3efe8`, alt sections / card / light text `#f1eee7`, polaroid `#fbf9f5`, headings + buttons `#4e0b12`, nav `#390007`, footer `#40050c`, olive `#202700` (countdown, buttons), lighter olive `#2c330a` (When / Where band, `--olive-2`), body text `#3a2a26` / `#2e2622`, fields `#e7e2d8`, rose `#915354`, Wedding Day card `rgba(220,162,163,.2)` (pink, round 14) + `#360000`; timeline = 14px dot with a 40px line above and below at 45% (`.dot::before/::after`), gap between rows. Fonts: Cormorant Garamond 500, Cormorant SC (labels), Pinyon Script (headings). Nav: links either side of the AR (`monogram-nav.svg`), all full opacity. Sizes = Figma px via `calc(N * var(--u))`.

### Images
Added: `hero-stairs.jpg` (shown at `object-position: 50% 26.6%` = Figma crop), `couple-arch.jpg` (RSVP background), `arch-photo.jpg` (landing arch, round 14), `story-polaroid.jpg`, `moment-1..5.jpg`, `details-polaroid.jpg`, `faq-hero.jpg`, `faq-polaroid.jpg`, `monogram-pill.svg`, `monogram-nav.svg`. Unused now (safe to delete): `hero.jpg`, `cathedral.png`, `pre1-3.jpg`, `couple-msg.jpg`, `story-hero.jpg`, `story-1..22.jpg`, `rsvp-bg.jpg`, `dress-*.jpg`, `monogram-ar.svg`, `monogram-frame.svg`, `monogram-letters.svg`.

### Invite codes: how it works (retired Nov 17, see section 0; kept for history)
- **Guests tab** of the Google Sheet is the guest list (one row per guest; same Party name = one invitation; a seat for an unnamed plus one is a row named "Plus One"). Columns A–I Anne/designer fill, J–O are automatic (code, invite sent, RSVP, dietary, replied at, plus one name).
- **Fill it (since Nov 16):** `setupAll` / Wedding > Add new invitations to Guests reads the "Invite codes" tab (section 0b). The older way, kept for reference: `python3 tools/anne_list_to_guests.py anne_list.csv` → `tools/guests_import.csv` (54 invitations, 80 seats on Nov 15), import into the Guests tab (File > Import > Append). Emails are not in Anne's list: they must be added before invites go out. Keep CSVs out of git.
- **Apps Script** (`apps-script/Code.gs`, run from the editor): `setupGuests` (header + how-to tab, safe to re-run), `makeCodes` (one `AR-XXXXXX` code per party, 6 chars without 0/O/1/I/L), `sendTestInvite` (sends the invite email to yourself), `sendInvites` (emails every party with an email and empty "Invite sent"; Gmail quota ~100/day on a personal account). **After pasting the new Code.gs: Deploy > Manage deployments > edit > New version**, otherwise the site's login / forgot / rsvp_party calls fail.
- **Site:** `invite.html` = code gate (wrong code, forgot → email, sent). The email link is `invite.html?code=AR-XXXXXX` and logs straight in. The party is kept in this browser (`localStorage` "ar_guest"). Logged in: landing shows "Welcome, <party>" + Continue; The Details shows "Your Table" once column H has a value (guests must log in again to see a table added later); RSVP shows one answer per guest, earlier answers filled in so they can change them. `rsvp.html` without a code redirects to the gate. Other pages stay public.
- **Answers** are written by Apps Script into the Guests tab (RSVP / Dietary / Replied at / Plus one name) and logged in the RSVP tab. The old Google Form is no longer used by the site (`RSVP_FORM` in config.js is ignored by the new RSVP page).
- **Demo mode** (empty SHEETS_URL): code `AR-7K2QX9` = sample Santos Family. **Tests:** `python3 -m http.server 8765` + `python3 tools/mock_apps_script.py`, then `python3 tools/test_invite_flow.py [width]` (mock codes AR-7K2QX9, AR-PL5ONE).
- FAQ "Can I bring a plus one?" still says guests "search" on the RSVP page (Anne's words); with codes it should say their partner's name appears when they open their invitation. Ask Anne before changing.

## 1. Brief and decisions

The designer shared the Figma link and asked for it to be built as a website, with clarifying questions first. Answers:

| Question | Answer |
|---|---|
| Build as | GitHub (static site on GitHub Pages, plain HTML/CSS/JS, no framework, no build step) |
| Backend for RSVPs + letters | Google Sheets via Apps Script (the Figma annotation suggested this) |
| Wedding date | **Dec 26, 2026** (matches the 261226 password). Every Figma frame was changed to Dec 26 on Nov 4 at the designer's request. |
| Scope | Everything, including the full message flow, secret inbox and PDF download |
| Repo name | anne-and-ryan-wedding |

Designer preferences to follow: keep explanations brief; match the Figma exactly; don't add things that aren't in the design without saying so.

**Figma rules for this file (current, since Nov 4):** fix the designer's **original frames directly, no copies**. Every change goes into both Figma (desktop + mobile) and the site. When one frame gets a fix, every similar frame gets the same fix. The yellow stars stay on the originals. Never delete the designer's frames. New layers get casual/default names (e.g. "Frame 136", "image 26"), not tidy ones. Use auto-layout padding/gap for spacing, never empty spacer frames.

### How the work went (so you can work the same way)
1. **Ask before building.** Read every Figma frame and annotation first, then asked 4 questions at once (build target, backend, the date conflict, scope). Nothing was built before the answers came back.
2. **Build and test in a sandbox.** Built the static site, then checked it with Playwright at 1440px and 402px against the Figma screenshots. Fixed what didn't match (class clash on Event Details, RSVP background, mobile overflow, flower backgrounds, inbox fitting the screen) and checked again.
3. **Deliver.** Zipped the repo and wrote the README + this handoff.
4. **Publish through the designer's own GitHub (account `iamlura`) in Chrome.** No GitHub token was available, so:
   - Created the repo at github.com/new (public), first named `anne-ryan-wedding`, then renamed it to `anne-and-ryan-wedding` at the designer's request (Settings → General → Rename).
   - Chrome's file-upload tool refused files from both the sandbox and the computer, so the site was saved to `Downloads\anne-and-ryan-wedding` and **the designer dragged the folder** onto GitHub's upload page.
   - Dragging the folder put everything inside an `anne-and-ryan-wedding/` subfolder. Instead of moving 70 files, a GitHub Actions workflow publishes that subfolder (section 7).
5. **Answer follow-ups briefly.** The designer prefers short answers and one question at a time.

## 2. Figma map

Desktop frames are 1920 wide, mobile frames are 402 wide. Node IDs:

| Screen | Desktop | Mobile | Nov type-scale copy (desktop / mobile) |
|---|---|---|---|
| Landing | 87:64448 | 87:112649 | none: the designer's own frames are the reference |
| Our Story | 87:64558 | 87:112730 | 94:2 / 95:2 |
| The Details (was Event Details; frame also named "Our Story" in Figma) | 87:64649 | 87:112817 | 94:94 / 95:89 |
| FAQ (new Nov 12) | 168:2 ("FAQ") | 168:49 | none |
| RSVP | 87:64724 | 87:112888 | 94:172 / 95:160 |
| Leave a Message (arch, empty) | **98:21 ("Leave a Message 7")**, replaced 87:64796 | 87:112929 | 94:246 / 95:201 (superseded) |
| Write a message | **98:7401 ("Leave a Message 8")**, replaced 87:64767 | 87:159001 | 94:216 / 95:46273 (superseded) |
| Make your arrangement | 87:111834 ("Leave a Message 2") | 87:159025 | 94:47296 / 95:46297 |
| Place your letter | 87:103999 ("Leave a Message 5") | 87:151171 | 94:39460 / 95:38443 |
| Arch with new letter | 87:72163 ("Leave a Message 6") | 87:120291 | 94:7614 / 95:7563 |
| Read message (arch) | 87:79998 | 87:128121 | 94:15450 / 95:15393 |
| Secret inbox: envelope | 87:87833 | 87:135951 | 94:23286 / 95:23223 |
| Secret inbox: open letter | 87:96149 | 87:143794 | 94:31606 / 95:31066 |

**The original frames (first column) are the reference, and every one is starred.** From Nov 4 the designer asked for fixes to go straight into the originals, no copies. The "Nov type-scale copies" 7000px below are an older experiment and are out of date; ignore them.

FAQ star: 168:92. Nov 12 new layers on the landing: When / Where "Frame 836" (desktop, in Frame 90) / "Frame 848" (mobile); countdown "Frame 843" / "Frame 855"; mobile nav bar "Frame 860" on every phone frame. Old landing sections (venue + calendar "Frame 107", cathedral "image 12", The Wedding Day "Frame 119" / "Frame 133", prenup "Frame 109" / "Frame 134") are hidden, not deleted. On The Details the old info row, timeline group and Reception/Parking/Kindly Note/Gifts frame are hidden too.

Key asset nodes: arch = Group 817 (87:64805), flowers = 87:111843 / 87:111937 / 87:112031, envelope = Frame 789 (87:96118).

Other nodes touched in the Nov rounds:
- Our Story carousel track (desktop) 87:64564: every card 440 wide, hug height, 400×600 image, 400-wide caption, top-aligned (Frame 136 was the reference card). Mobile cards in 87:112730 hug too.
- Footers: on every frame the nav (Frame 94) was removed and an RSVP button added (desktop: copy of 90:13, mobile: copy of 90:19). Desktop padding 120 / 338, gap 40; mobile 37 / 52, gap 30.
- Green tuxedo photo: "image 26" (87:64711) on Event Details; the mobile frame uses the same fill.
- Nov 8: Dress code swatches = "Frame 825" (desktop 135:2, mobile 135:28); Reception / Parking / Kindly Note / Gifts = "Frame 166" (desktop 135:15 in Frame 90, mobile 135:41 in Frame 89). Event Details background ("image 12", 87:64652 / 87:112880) is hidden since the 6th round.
- Prototype: the landing Prenuptial Photos section has a click interaction to the Our Story frame (desktop and mobile).

### Figma annotations, and how each was built
| Annotation (text in Figma) | Implementation |
|---|---|
| all nav bars are static, current page opacity 100%, other page opacity 60% | `.nav` is `position:absolute` (not sticky); `aria-current="page"` gets opacity 1, the rest .6 |
| light bg change nav bar text to black | `.nav--light` (white text) only on landing + RSVP |
| s1 fade in / s2 snap scroll and fade in / s3 snap scroll and fade in (Event Details) | `[data-fade]` + IntersectionObserver; `html.snap-y` uses `scroll-snap-type: y proximity`. After the redesign: s1 = heading + info row + itinerary, s2 = dress code |
| we might need google sheets extension for RSVP | `apps-script/Code.gs` |
| submit opacity 50% if fields not complete | button `disabled` → `opacity:.5`; food required only when attending = Yes |
| may change content* (RSVP copy) | copy kept as designed |
| overflow = scroll (message box / letter) | textarea + `.letter` have `overflow-y:auto` |
| [add font / text size / emoji picker] | toolbar: Classic/Modern/Script font, A− A A+, emoji popover |
| 50% opacity if both fields not finished, no inappropriate content | Next disabled until name + message; `filter.js` + server check |
| drag flowers, max 4, allow delete | pointer-event drag from the palette; drag off the envelope or × to delete |
| user can go next without flowers | Next is always enabled on the arrange step |
| drag letter; if dropped outside the arch it snaps to the nearest line; no overlap, other notes move to make space | `notes.js`: `nearestS()` projects onto the arch path; `layout()` (pool-adjacent-violators) spreads notes with minimum movement; neighbours slide live while dragging. Since Nov 8 the letter starts in the middle (desktop: just above "Place your letter"; mobile: centre of the arch) and Send is at 50% until it's on the arch |
| back to the first page with the new note added | after Send → home step, new pin animates in |
| secret page: Anne clicks Leave a Message 5 times → password 261226 | 5 taps within 4s on the heading or nav link → modal → password checked by Apps Script |
| browse all notes / click note to open, dissolve animation / clicking next shows envelope again | inbox overlay, `.viewer.is-open` opacity + blur crossfade, Next resets to the envelope |
| downloading creates a downloadable pdf | jsPDF + html2canvas (cdnjs, loaded on demand); one note or all notes |

## 3. How it was built (reproduce in this order)

1. **Read the Figma.** `get_metadata` on 87:64447 for the frame list, then `get_screenshot` of every frame plus the mobile ones. Read the annotation text nodes (listed above).
2. **Pull exact specs.** `get_design_context` on each desktop page frame (landing, story, details, RSVP, envelope). This gives fonts, sizes, gaps and colors (section 4) and the image asset URLs.
3. **Download assets** from the `get_design_context` asset URLs into `assets/img/`. Many "png" assets are really JPEGs: rename to `.jpg`. Then compress with Pillow: long edge ≤1800px (story cards ≤1100, dress photos ≤1000), JPEG q78, progressive. Dress m2/m3 have transparency: composite them on `#a19f92` / `#bcb7b4` (their Figma backing fills) before converting to JPEG.
4. **Arch:** `download_assets` on 87:64805 as SVG (1.5MB). Delete the two background `<rect>`s, then `tools/arch_rasterize.py` → `arch.webp` (1920×1652, transparent).
5. **Flowers:** `download_assets` on the 3 flower groups, PNG at scale 3. They export with an opaque #EFEFEF background and black slot borders, so run `tools/flower_keyout.py` to make them transparent. Then set the aspect ratios in `notes.js → FLOWERS`.
6. **Envelope:** its body and flap SVGs come from `get_design_context` on 87:96118 (`env-body.svg`, `env-flap.svg`). The "From X" text is live in Carattere.
7. **Build the pages:** desktop first, using Figma px × `--u`, then mobile overrides at ≤760px from the 402 frames.
8. **Backend:** `api.js` (falls back to localStorage demo mode when `SHEETS_URL` is empty) + `Code.gs`.
9. **Verify** (section 6), then deploy (section 7).

## 4. Design tokens

- **Fonts (Google Fonts, since Nov 12, Anne's request):** Cormorant Garamond 500 for all text, Cormorant SC 500 (brand, small-caps labels like DATE / CHURCH / DAYS), Pinyon Script for every header (`h1`, `h2`), the hero name, footer "RSVP", signature and envelope. Afacad is still loaded only for the "Modern" option in the letter font picker (`--letter-sans`). (History: Cormorant was tried Nov 8 and undone; Anne asked again Nov 12 and the designer said yes.)
  - Figma mapping used: Afacad / Playfair → Cormorant Garamond Medium at the same size; text that was ≥48 (desktop) / ≥40 (phone) or a section heading → Pinyon Script at 4/3 size; Playfair SC → Cormorant SC; Carattere → Pinyon.
- **Colors (Nov 12, Anne's scheme):** burgundy `#4a1a22` (nav bar, buttons, footer, countdown), olive `#837f5a` (When / Where band, Close button), cream `#eee6d3` (page bg, light text on dark), text `#3b1a20`, story bg `#e6dcc5`, story card / letter `#f2ebdc`, field `#e6dcc5`. Nav: burgundy bar with a 1px cream (35%) bottom border on every page; phone nav = 68px burgundy bar with a cream burger. The arch, flowers and lavender envelope artwork were not recoloured. Old values (before Nov 12): page bg `#efefef`; story bg `#e0e0e0`; story card `#e7e7e7`; input/field `#e1e1e1`; black `#000`; envelope body `#c7b8d4`, flap `#9a80b0`, stroke `#898989`; RSVP radio on `#b4fff9`, off ring `#8f8f8f`; carousel arrow bg `#d1d1d1`, chevron `#393939`; inbox Close button `#8a8a8a`.
- **Scaling:** `--u: clamp(0.5px, 0.0520833vw, 1px)`, so 1 Figma px = 1px at 1920 wide. Every size is `calc(N * var(--u))` with N copied from Figma. Mobile (≤760px) uses explicit px from the 402 frames.
- **Type scale (Nov 2026, set by the designer on the landing page).** CSS variables at the top of `style.css`, mobile values in the ≤760px block. Change one and every page follows:

| Variable | Used for | Desktop | Mobile |
|---|---|---|---|
| `--fs-title` | page titles, When / Where (Pinyon) | 80 | 53 |
| `--fs-head` | section headings (A message from the couple, The Wedding Day, Dress Code) | 64 | 40 |
| `--fs-val` | values (Details facts, When date, venue names, schedule times) | 40 | 24 |
| `--fs-input` | form inputs, RSVP radios, message box | 32 | 24 |
| `--fs-item` | landing timeline items, "in a glance" | 40 | 28 |
| `--fs-body` | body + intro copy, Event Details sub-headings (Itinerary, Dress Code, gown/barong), story captions, letter | 32 | 24 |
| `--fs-label` | small labels, dress notes | 32 | 18 |
| `--fs-btn` / `--btn-track` | every button, "Write a Message" style: hugs its text, padding 20/60 (mobile 16/40), white 1px outline, gray #898989 for Close/Cancel | 32 / 20% | 24 / 20% (inbox 18) |
| `--fs-nav` | nav | 24 | 26 (menu) |

  Nov 12 one-offs: hero name Pinyon 150 / 60, hero date 32 / 18 uppercase 15% tracking, monogram 126×180 / 56×80; countdown numbers 120 / 48, labels Cormorant SC 24 / 14; FAQ questions Pinyon 48 / 32, answers 32 / 20; small-caps labels 24 / 16 with 20% tracking; footer "Complete RSVP Form" button 18px with 16/32 padding on phones.
  Older one-offs from the designer's frames: itinerary items on Event Details are Playfair 38; "The Wedding Day" uses `--fs-title` on desktop but 32 on mobile; mobile venue name is Playfair 32 (desktop is Afacad 60); mobile Dress Code title is Afacad 40, centred; Reception / Parking / Kindly Note / Gifts headings are Playfair (`--fs-body` on desktop, `--fs-head` centred on mobile), their text is Afacad on desktop and Playfair on mobile (same as the dress code text). Footer stays Carattere 80/40 (mobile 36/24); mobile footer text is left-aligned.
- **Other sizes (desktop):** nav 161 gap, 80 tall; footer (every page, same as the landing footer): padding 120, gap 40, "Thank you" block + RSVP button, ~503 tall; mobile footer: padding 37/52, gap 30, left-aligned; story cards 440 wide (400×600 photo, padding 20, gap 10, height hugs the caption); page padding 260 top, 200 sides.
- **Overlays:** landing hero photo opacity .4 on black; venue cathedral .3; Event Details has no background image (removed Nov 8, too busy); RSVP photo blur 20px CSS (Figma layer blur 40) + 50% black.

## 5. Code map

Repo layout: `.github/workflows/pages.yml` at the root, everything else inside `anne-and-ryan-wedding/`. Paths below are relative to that folder.

```
index.html  story.html  details.html  faq.html  rsvp.html  message.html
assets/css/style.css     all styles, type scale tokens, mobile overrides
assets/js/content.js     shared wedding facts (date, times, venues, itinerary, RSVP deadline) + landing countdown
assets/js/config.js      SHEETS_URL, MAX_FLOWERS, MAX_MESSAGE
assets/js/api.js         Sheets client (text/plain POST to dodge CORS preflight) + demo fallback
assets/js/filter.js      bad-word filter (EN + Filipino)
assets/js/common.js      mobile menu, fade-ins, story carousel, toast, demo badge
assets/js/notes.js       envelope/bouquet renderer, arch geometry, overlap layout
assets/js/message.js     message steps, flower drag/drop, arch placement, secret inbox, PDF
assets/js/moments.js     Our Story photo strip: repeats the set, drifts, loops both ways
assets/js/rsvp.js        RSVP: last-name search, pick, one answer per guest, thank-you
apps-script/Code.gs      Google Apps Script backend
tools/                   asset scripts + Playwright tests + mock backend
```

### Changing content (info is expected to change)
- **Date, times, venues + cities, reception time, itinerary, RSVP deadline, countdown target (`ceremonyISO`):** edit `assets/js/content.js` only. Elements with `data-c="..."` on the landing, Event Details and RSVP pages are filled from it, and the landing calendar strip (Sun–Sat around the date) is rebuilt automatically. The HTML keeps the same text as a no-JS fallback, so update it too when convenient.
- **Not covered by content.js** (edit the HTML directly): page `<title>` / meta description in `index.html` (contain the date), the couple's message, the story text (`story.html`), dress code text (`details.html`), FAQ questions (`faq.html`), the landing "Champagne Room at The Manila Hotel" line (worded differently from The Details), RSVP form labels.
- **Sizes:** change the type-scale variables (section 4), not individual rules.

**Invitation source (Nov 8):** the couple's printed invitation (Main Invite Card, Details Cards, RSVP Card PDFs, emailed by Anne Marie Zamora on Nov 8). Facts used: Saturday 26 December 2026; ceremony 2:30 PM at the Minor Basilica of San Sebastian, Quiapo, Manila; reception to follow at Champagne Room, The Manila Hotel (cocktail hour and dinner); kindly reply by Dec 5, 2026; dress code, parking, kindly note and gifts text copied word for word.

**Dress code (Nov 16, Anne's Canva card):** text = "Formal attire" / "Gentlemen: suit and tie (no barong)" + "Ladies: floor-length dress" / the muted, earthy tones paragraph; 5 swatches: prints `assets/img/swatch-olive.webp` and `swatch-moss.webp` (cropped from her screenshot, so only 86px; ask for the source files if they look soft), flat `#9b6670` dusty rose, `#6a2b3c` burgundy, `#49342f` brown. The old swatch-1/2/6/7.webp are now unused. **Older (Nov 8) dress code swatches:** 10 circles from the invitation. Flat colors are CSS backgrounds (#ceae7e, #bc8269, #846555, #9a5657, #610e08, #3f1521); the 4 prints are `assets/img/swatch-1/2/6/7.webp`, cropped from the invitation PDF. Desktop 120px circles with an 8px white ring, gap 24, left-aligned; mobile 56px, ring 4, gap 12, centred. The old dress photos (`dress-*.jpg`) are no longer used on the page but are still in `assets/img`.

**Data model:** a letter is `{id, t, from, text, font: serif|sans|script, size: s|m|l, flowers: [{f:1-3, x, y, r}], pos: 0..1}`. Flower x/y are fractions of the 1000×900 note box (y is the stem bottom); `pos` is the fraction along the arch (0 = bottom-left, 1 = bottom-right). The public `notes` endpoint never returns `text`.

**Arch geometry** (units of the 1920×1652 artwork): circle center (960, 988.658), radius 822.945, left line x 137.055, right line x 1782.95, usable bottom y 1540. Note width = 13.3% of the stage (min 72px), minimum spacing = 72% of note width.

## 6. Verification (run before every deploy)

```bash
python3 -m http.server 8765                         # from anne-and-ryan-wedding/
cd tools && python3 screenshots.py index,story,details,rsvp,message 1920
python3 screenshots.py index,story,details,rsvp,message 402
python3 test_message_flow.py                        # desktop; W=402 for mobile
python3 mock_apps_script.py & python3 test_backend_flow.py
python3 test_rsvp_form.py                           # RSVP page posts the right fields to the Google Form (intercepted, nothing sent)
```

Compare the screenshots against the Figma frames at the same widths (the starred originals, section 2). `screenshots.py` forces lazy images to load so full-page shots are complete. The flow test seeds 9 letters, writes one, drags 5 flowers (checks the max of 4), drags the letter onto the arch, sends, opens the inbox with a wrong and then the right password, opens a letter and downloads a PDF.

## 7. Deploy (current setup)

- **Pages source:** Settings → Pages → Source = **GitHub Actions** (not "Deploy from a branch").
- **Workflow:** `.github/workflows/pages.yml` publishes the `anne-and-ryan-wedding/` folder on every push to `main` (about 30 seconds; progress shows in the Actions tab). Full file:

```yaml
name: Deploy site to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: anne-and-ryan-wedding
      - id: deployment
        uses: actions/deploy-pages@v4
```

- **To edit:** change files under `anne-and-ryan-wedding/` on GitHub (pencil icon) or locally and push to `main`. The site redeploys on its own.
- **Uploading a batch of changed files without git:** on the repo's root page, Add file → Upload files, and drag the whole `anne-and-ryan-wedding` folder. Files land at `anne-and-ryan-wedding/...` and replace the old ones (new files are added, nothing is deleted).
- **Live URL:** https://iamlura.github.io/anne-and-ryan-wedding/
- **How the Nov rounds were published (no git):** `git push` from the sandbox was refused (no token), so Claude uploaded through GitHub's web upload page in the browser the designer was signed in to: open `github.com/iamlura/anne-and-ryan-wedding/upload/main/anne-and-ryan-wedding/<folder>`, add the changed files, "Commit directly to main". One upload page per folder (e.g. `assets/css`, `assets/img`, then the root for the .html files). The designer signs in herself; never type her password.
- **Images and other files from the sandbox (Nov 17, round 22):** Claude in Chrome's `file_upload` tool takes sandbox paths and fills the upload page's file input (find the "Choose your files" input ref; up to 3.8 MB per call, several calls add up on the same page), then commit. Text files can also be built in the page with `DataTransfer` + `File` and SHA-256 checked (rounds 20–21).
- **Check a deploy:** about a minute after the commit, compare the live files with your local copies (e.g. `curl -s https://iamlura.github.io/anne-and-ryan-wedding/assets/css/style.css | sha256sum`).
- **Copies outside GitHub:** the designer's `Downloads\anne-and-ryan-wedding` folder (may be older). GitHub is the source of truth.
- **Google Sheet (current, since Nov 16): Ryan's "Guest List for Wedding Website"**: https://docs.google.com/spreadsheets/d/1HqWuWL7zTKcbcaN-sLxrb0pIZ7qdk8442e-J3aJzkgU/edit (tabs in section 0b).
  - Apps Script project "Anne & Ryan wedding backend" (Extensions → Apps Script from that Sheet): https://script.google.com/home/projects/1mkz-2VXqmOfPcZSIz1FjVMbqnR_L6CjyVGYSPkY52CKmRzXMFZpWYAAk/edit . Web app URL (`SHEETS_URL`): https://script.google.com/macros/s/AKfycbwXpb1HsrpULn_S6y7OjTSGNjQZuhCAWOlb9-u5X_dgQWge4dJ3I-BjIrzFVD6dpYyFkw/exec (deployment "wedding site", Execute as the designer, access Anyone). Handles letters, arch, inbox, code login, forgot, RSVP per guest.
  - **If `Code.gs` changes:** paste it in, save, then Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy. The URL stays the same. (How Claude pasted it on Nov 16 without a file upload: committed Code.gs to GitHub first, then in the Apps Script tab `monaco.editor.getModels()[0].setValue(await fetch(<raw.githubusercontent URL at that commit>).then(r => r.text()))`, checked the SHA-256, Cmd+S.)
  - Tested Nov 16: `?action=notes` returns the copied letter; `login` with AR-FBXQ65 returns Laura's party (2 guests). No RSVP was submitted.
- **Old Google Sheet + Form (Nov 8 - 16, retired, designer's account):**
  - Sheet "Anne & Ryan wedding": https://docs.google.com/spreadsheets/d/1oapFYPqkLcdA2HVhomGbhMsxTLJFqUznyo01xG-Pj1E/edit (tabs: `Form Responses 1` = RSVPs, `Messages` = letters, empty `Sheet1`). Its 1 letter was copied to the new Sheet. Its own web app URL (below) is no longer in `config.js`.
  - RSVP Google Form "Anne & Ryan · RSVP" (edit): https://docs.google.com/forms/d/1_ThJxf8_-yC91_bBPNux_fBBG6INbunYO0SL8dQRLIk/edit . Same 4 questions as the site. The site's RSVP page keeps the Figma design and posts into the form in the background (`RSVP_FORM` in `config.js`, `submitRSVP` in `api.js`). Google doesn't let the page read the reply, so only network errors show; check the Responses tab.
  - Apps Script project "Anne & Ryan wedding backend" (Extensions → Apps Script from the Sheet). Web app URL (`SHEETS_URL`): https://script.google.com/macros/s/AKfycbwQhSGcBC5b9NM1cZOeUO0G36JdCyobdRdrUZ8NVYFaJoL0n42SrGXRBiJHPDmX3vpBWg/exec (Execute as Me, access Anyone). Handles letters, the arch and the 261226 inbox. (Its `delete` endpoint is left over from the removed guest-delete feature; nothing calls it and new letters have no delete key, so it can't remove anything.)
  - Tested Nov 8: a letter went through save → arch → inbox, and an RSVP landed in the form + Sheet. Both test entries were deleted.
  - How it was set up (to redo it): new Sheet → Extensions → Apps Script → paste `apps-script/Code.gs` → run `setup` (approve Google's prompt: Advanced → Go to project → Allow). `setup` makes the `Messages` tab, the inbox password and the RSVP form, and logs `RSVP_FORM` values for `config.js`. Then Deploy → New deployment → Web app → Me / Anyone (approve again) → paste the `/exec` URL into `SHEETS_URL`.
  - If `Code.gs` changes later: paste it again, then Deploy → Manage deployments → edit → New version (the URL stays the same).
  - Tests never write to the live Sheet: `test_message_flow.py` forces demo mode, `test_backend_flow.py` uses the local mock.

## 8. Open items

1. **Share with Anne:** the Sheet and the RSVP form are in the designer's Google account. Share both with Anne (Share → her email, Editor) so she sees RSVPs and letters.
2. **Prenup photos.** The Nov landing design replaced the "See Prenuptial Photos" button with a "Prenuptial Photos" heading, so the button was removed from the site. If a full album is wanted later, it needs a design (shared album link or a `gallery.html` with resized copies: long edge ≤1800px, JPEG q78).
3. **Removing a letter:** guests can't delete letters (removed Nov 8 at the designer's request). Anne removes one by deleting its row in the Messages tab, or hides it by setting `hidden` to TRUE.
4. **Confirm these interpretations with the designer:**
   - The mobile hamburger menu has no Figma design (built as a black overlay).
   - Note tilt on the arch: left half leans counter-clockwise, right half the mirror (clockwise), 30–41° per letter (designer, Nov 8; her example is on Page 1: right envelope −31.6°, the final-pages left envelope +41°).
   - Food restrictions are optional when not attending.
   - Itinerary lines are continuous between dots (the mobile Figma shows short segments).
   - The mobile landing's 4th prenup thumbnail reuses photo 1 (as in Figma).
   - Itinerary: the invitation gives no reception time, so the 2nd item reads "To follow" (designer's choice, Nov 8). The 6:00 PM dancing item was dropped.
   - Mobile RSVP radios are stacked (the invitation wording "Joyfully accepts / Respectfully declines" doesn't fit side by side at 402).
   - Figma: the old dress photo columns and the 3rd itinerary row were hidden, not deleted (Frame 824 98:4, mobile 87:112860 / 87:112870, itinerary rows 87:64685 / 87:112851 / 87:64527 / 87:112705).
5. **Nov 12 notes to confirm:**
   - FAQ "Can I bring a plus one?" says guests search their name on the RSVP page. That guest-login RSVP is still only a Figma draft; until it's built the answer describes something the site doesn't do yet.
   - The landing calendar strip and cathedral drawing were dropped with the old venue section (Anne's When / Where text didn't include them).
   - Flowers are pink / red / deep rose since Nov 19 and the envelope dusty rose since Nov 18.
   - The landing prenup photos are gone (Anne's request); the photos stay in the Our Story carousel, now without captions.
6. **Sharper flowers (optional):** re-export the flowers from Figma with the background hidden instead of keying it out.

## 9. Change log

- **Oct 8, 2026:** launch.
- **Nov 4, 2026:**
  - Figma: copied every non-landing frame (desktop + mobile) 7000px below the originals and applied the designer's new landing type scale (table in section 4). Originals untouched; yellow stars on the copies.
  - Site: type scale as CSS variables, applied to all pages.
  - Landing: smaller hero name/venue/buttons, "Prenuptial Photos" heading (button removed), RSVP button in the footer, mobile prenup = 1 large + 3 thumbnails, mobile venue in Playfair with the weekday, mobile footer left-aligned.
  - Event Details redesign: Location / Date / Time in one row between two lines, Itinerary stacked under it (mobile: Location, Time, Date stacked; Itinerary heading centred).
  - RSVP: radio options use the value size (they were picking up the label size).
  - New `assets/js/content.js` for shared facts.
- **Nov 4, 2026 (2nd round):** rebuilt to the designer's own updated frames.
  - Figma: every remaining "December 25" changed to 26 (final pages originals + Page 1). Removed my stars from the copies her frames replaced.
  - Event Details: Location / Time / Date row, smaller headings (Playfair 32), values 40, itinerary 38, Dress Code with Women and Men side by side (3 + 2 photos), new intro copy.
  - Our Story: hero photo 1571×1408, first card smaller (440 wide), small white round arrows, tighter section padding.
  - RSVP: inputs and radios at 32, white radio fill, stronger blur, two-line intro on desktop.
  - Leave a Message: arch page 1606 tall with a small "Write a Message" button; write step inputs at 32, 545-tall message box.
  - Landing: prenup photos 400×600 with 120 padding; footer 504 tall.
  - Message box and inbox letter sizes now follow the type-scale variables (set in `message.js`).
- **Nov 4, 2026 (3rd round):** designer asked for fixes directly in the original Figma frames (no copies).
  - Figma + site: every footer (desktop + mobile) now has the nav links under "Thank you"; all buttons use the "Write a Message" style (hug, 32 / 20%, 20/60 padding; mobile 24 and 16/40); first carousel card back to 573×980 and all cards top-aligned (desktop + mobile); remaining old Leave a Message frames got the 60 / 32 type sizes. Stars moved to the originals.
  - Site: guests could delete their own letter; test `tools/test_delete_flow.py`. (Both removed Nov 8, 8th round.)
- **Nov 4, 2026 (4th round):** Figma originals + site.
  - Footers: every footer (desktop + mobile) is now the landing footer: "Thank you" + RSVP button, no nav links.
  - Our Story carousel: all cards 440 wide with 400×600 photos, height hugs the caption (mobile cards hug too).
  - Landing: the Prenuptial Photos heading and photos link to `story.html#moments` (in Figma: a click interaction to the Our Story frame).
  - RSVP thank-you state: "Leave Anne & Ryan a message" is a white outline button.
  - `dress-m4.jpg` replaced with the designer's new green tuxedo photo (no zoom icon); the mobile Figma frame now uses it too.
- **Nov 8, 2026 (5th round):** matched everything to the couple's printed invitation. Figma originals (desktop + mobile) + site.
  - Fonts: Cormorant Garamond everywhere, Cormorant SC for the brand/calendar, Pinyon Script for script text (free stand-in for the invite's Citadel Script Pro). Mobile footer line kept on one line.
  - Facts (`content.js` + HTML fallbacks + landing meta): time 2:30 PM, venue Minor Basilica of San Sebastian, RSVP by Dec 5, 2026, itinerary = 2:30 PM Ceremony at Minor Basilica of San Sebastian / To follow: Cocktail hour and dinner at Champagne Room, The Manila Hotel.
  - Event Details: Dress Code rebuilt with the invitation text (formal attire, suit and tie, no barong, floor-length dress, muted earth/autumn tones, avoid white/cream/beige) and the 10 color swatches; dress photos removed. New section after it: Reception, Parking, Kindly Note, Gifts.
  - RSVP: radios read "Joyfully accepts / Respectfully declines" (values stay Yes/No for the Sheet), "Food Restrictions" → "Special dietary requirements" (mobile Figma label was "Allergies"), radios stacked on mobile.
  - `tools/test_backend_flow.py` clicks the new radio label.
- **Nov 8, 2026 (6th round):** designer didn't like the invitation fonts. Figma originals + site.
  - Fonts back to Afacad / Playfair Display / Playfair Display SC / Carattere (site CSS variables, font links, letter picker). In Figma each text layer got its previous font back; the new Reception / Parking / Kindly Note / Gifts text follows the dress code styles. Mobile footer texts back to 299 wide.
  - Event Details background image removed (site: `details__bg` img + CSS; Figma: "image 12" hidden on desktop + mobile).
- **Nov 8, 2026 (7th round):** Figma originals + site + Google.
  - Our Story carousel: every card the same height (site: `align-items: stretch`; Figma: all cards fixed to the tallest, desktop 822, mobile 530). Mobile captions 18, same as the hero intro (Figma was 16.3, site was 24). Desktop captions were already 32 = hero intro; the bigger, different-looking captions the designer saw were the fallback fonts showing for a minute between two deploy commits.
  - RSVP sub-headings (First and Last Name, Email Address, Will you be attending?, Special dietary requirements) in Playfair Display at `--fs-body` (32 desktop, 24 mobile), same as the Dress Code heading.
  - Google: created the Sheet, the RSVP Google Form and the Apps Script web app in the designer's account; `config.js` now has `SHEETS_URL` + `RSVP_FORM`, so the site is out of demo mode. New test `tools/test_rsvp_form.py`.
- **Nov 8, 2026 (8th round):** Leave a Message.
  - Envelope tilt follows the side of the arch: left half counter-clockwise, right half clockwise (mirror), 30–41° depending on the letter (`tiltFor(id, s)` in `notes.js`, applied in `placePin` so the letter being placed flips as it crosses the top).
  - Guest delete removed: no × on letters, no confirm box, no delete token (`message.js`, `message.html`, `api.js`, CSS); `tools/test_delete_flow.py` removed. Figma never had it, so no Figma change.
- **Nov 8, 2026 (9th round):** "Place your letter" step.
  - The letter now waits in the middle instead of on the left of the arch: desktop just above the "Place your letter" heading, mobile in the centre of the arch, tilted 41° like the Figma envelope (`placeHome` in `message.js`). It resets there each time a guest comes from the flowers step. Dropping it anywhere snaps it to the nearest spot on the arch; arrow keys start at the top of the arch.
  - Send Message stays at 50% (disabled) until the letter is on the arch.
  - Fix (same day): on tall/wide desktop windows the letter was wrongly put in the arch centre (phone placement); now phone placement only applies when the heading sits above the arch.
  - Figma: moved the envelope ("Frame 107") on Leave a Message 5 (desktop 87:111355, above the heading) and its mobile frame (87:158526, centre of the arch).
- **Nov 9, 2026 (10th round):** new monogram, guest list, guest-login designs.
  - Monogram: Anne's "AR" from Canva (font Palash, a Canva font, so it was traced to a vector rather than using the font). Site: `assets/img/monogram-ar.svg` (white, landing hero; replaces the oval frame + letters) and `assets/img/favicon.svg` (white AR on burgundy #511d21, every page). Figma: new "Group 90" in the landing hero (desktop 147:4, mobile 147:6); the old monogram "Group 88" is hidden, not deleted. `monogram-frame.svg` / `monogram-letters.svg` are no longer used.
  - Guest list: `setupGuests()` in `apps-script/Code.gs` adds a "Guests" tab (one row per guest, grouped by Party; columns Party, Guest name, Email, Seats reserved, Plus-one allowed, Child, Invited to, Table, Notes, then grey automatic columns Invite code, Invite sent, RSVP, Dietary requirements, Replied at) and a "How to fill" tab with an example. Anne fills it in; codes and emails come in a later round.
  - Planned guest flow (agreed with the designer, not built yet): Anne fills Guests → "Send invites" makes one code per party and emails it with a personal link → the link logs the guest in (or they type the code on an "invite code" screen; "Forgot your code?" resends it) → site shows "Welcome, <Party>", their table, and an RSVP with one accept/decline per named guest + dietary → answers land in the Guests tab. Details/table would be loaded from the Sheet after a valid code so they aren't in the public page. Emails would come from whichever Google account owns the script (currently the designer's; Gmail limit about 100 a day).
  - Figma drafts on "final pages", right of everything else (x ≈ 55000–73800): "invite code" (desktop 148:2, mobile 148:36), "invite code forgot" (148:70 / 148:85), "invite code sent" (148:100 / 148:115), "welcome" (148:130 / 148:244: a full-screen welcome shown after the code, "Welcome, Santos Family" above the monogram + "Continue", then the normal site; the designer set its spacing herself, don't change it; the rest of the landing sections in these frames are hidden), "Event Details logged in" (148:331 / 148:436, 4th info column "Your Table"), "RSVP logged in" (148:534 / 148:615, one row per guest), "invite email" (148:719, 680 wide).
  - Same day: mobile drafts use the site's mobile type scale (body 24, small labels 18, itinerary items 28). Invite placeholder reads "Invite code". Unused frames (the old Nov 4 type-scale copies 94:* / 95:*) moved to a new "archive" page; "final pages" now only has frames in use, their stars and annotations.

- **Nov 9, 2026 (11th round):** phone form sizes, flow order in Figma.
  - Phone (≤760px) `--fs-input` 32 → 24 px, same as body text, so form answers and radio labels match the desktop ratio (on desktop inputs = body = 32). Affects RSVP inputs/radios and the Leave a Message inputs. Figma: the same texts set to 24 in the mobile RSVP (87:112888), RSVP logged in (148:615) and Write a message (87:159001); in 87:112888 the "Will you be attending?" block now fills the width (it stuck out 20px to the left).
  - "final pages" now reads left to right in the guest's order: invite email (148:719) → invite code (148:2 / 148:36) → **invite code wrong** (new, 156:2 / 156:18: typed code, pink outline + "That code doesn't match…") → invite code forgot (148:70 / 148:85) → invite code sent (148:100 / 148:115) → welcome (148:130 / 148:244) → landing page and the rest as before. "Event Details logged in" and "RSVP logged in" sit directly under their originals. **RSVP sent** (new, 156:34 / 156:105: form hidden, "Thank you!" + "We can't wait to see you, Santos Family!" + "Leave Anne & Ryan a message", like the site's done state) sits after RSVP. Short notes (same style as the designer's) next to welcome, wrong code, the logged-in frames and RSVP sent. No original frames or stars moved.

- **Nov 12, 2026 (12th round):** Anne's Google Doc "Wedding Website!". Figma originals (desktop + mobile, incl. the guest-login drafts) + site.
  - Fonts: Cormorant Garamond for text, Pinyon Script for headers, Cormorant SC for small caps (section 4).
  - Colors: burgundy / olive / cream everywhere (section 4). Nav is a burgundy bar with a border; phone frames got a burgundy bar behind the burger.
  - Nav: "Event Details" → "The Details", new "FAQ" item.
  - Landing: smaller monogram, "Anne & Ryan" in Pinyon, "December 26, 2026" instead of the invitation line; When / Where on an olive band (When: Saturday, December 26, 2026 / Ceremony: 2:30 PM / Reception to follow; Where: Church = Minor Basilica of San Sebastian, Quiapo, Manila; Reception = Champagne Room at The Manila Hotel, Ermita, Manila); The Wedding Day and Prenuptial Photos removed; live countdown (days / hours / minutes / seconds to Dec 26, 2:30 PM Manila) on a burgundy band; new couple message signed "Anne and Ryan".
  - Every footer: "RSVP" / "Please respond by December 5, 2026 so we can save you a seat." / "Complete RSVP Form" button.
  - Our Story: Anne's story text replaces "Eight Years, One Love"; carousel captions removed.
  - The Details: centred layout; DATE / CEREMONY (2:30 PM at Minor Basilica of San Sebastian) / RECEPTION (4:30 PM at Champagne Room, The Manila Hotel); "Please come at least 15 minutes..." removed; "Itinerary" → "The Wedding Day" with 2:30 Wedding Ceremony, 4:30 Cocktail Hour, 5:30 Dinner, 8:30 Farewell; dress code centred; Reception / Parking / Kindly Note / Gifts removed (now in the FAQ). Logged-in draft frames updated the same way (with "Your Table").
  - New FAQ page (`faq.html`, Figma 168:2 / 168:49) with Anne's 7 questions; "here" links to the dress code (`details.html#dress`).
  - `tools/test_backend_flow.py`: places the letter (arrow key) before Send, since Send has been disabled until the letter is on the arch (9th round).

- **Nov 15, 2026 (13th round):** Anne picked design AC; her mashup notes; RSVP by invite code. See section 0c.
- **Nov 15, 2026 (14th round): matched the designer's Figma updates on "final pages AC".** How it was checked: every visible text layer compared with the site (all match), then Figma screenshots vs site screenshots at 1920 for every AC frame. Changes:
  - Landing arch: new photo (them looking at each other), `assets/img/arch-photo.jpg`, cropped to Figma 217:19's image transform.
  - Hero: same `hero-stairs.jpg`, crop moved up (`object-position: 50% 26.6%`, from Figma 216:11: image top -31%).
  - When / Where band `#2c330a` (`--olive-2`), countdown stays `#202700`; the thin line above the countdown removed (not in Figma).
  - The Wedding Day card pink `rgba(220,162,163,.2)`; timeline dots 14px with separate 40px lines (45%) instead of one continuous line.
  - Not changed (known, kept from round 13): Leave a Message follows the older frames (Figma AC frame has a narrower arch); the RSVP card's sample data differs from the Figma sample.
  - Figma: AC row copied to y 38870 from x -29760 (star 218:289), notes 1–6 applied there, plus 4 new RSVP screens (not found, party, plus one, sent). Old AC row untouched.
  - Site: `style.css` rewritten for AC (Leave a Message / inbox rules kept, recoloured through the variables); new nav + footer markup on every page; landing, Our Story, The Details, FAQ and RSVP markup follow the AC frames.
  - Invite codes: `invite.html` + `assets/js/invite.js`, `assets/js/rsvp.js` rewritten, `Guest` session helper in `common.js`, `login` / `forgot` / `rsvpParty` in `api.js`, Apps Script `makeCodes` / `sendInvites` / `sendTestInvite` + actions `login` / `forgot` / `rsvp_party`, `tools/anne_list_to_guests.py`, `tools/test_invite_flow.py`, mock backend actions. Removed `tools/test_rsvp_form.py`. (A name-search version was tried first and dropped.)
  - Figma: moved to new page "final pages AC" with Anne's notes + screenshots; invite-code flow row restyled to AC; designer's colour edits (olive card buttons, rose answer pills) carried to the site.
  - `content.js`: schedule items get a dot (`<span class="dot">`) for the AC timeline.
- **Nov 15, 2026 (publishing):** rounds 12 + 13 pushed to main through the web upload page. From now on no patches: the copy-paste prompt at the top of this file + the repo are the whole handoff.
- **Nov 15, 2026 (15th round):**
  - No rubber-band overscroll on any page: `overscroll-behavior: none` on `html` and `body` (top of `style.css`).
  - FAQ hero (Figma 216:200): same `faq-hero.jpg`, crop moved down to the couple walking, `.photo-head--faq img { object-position: 50% 71.6% }` (Figma: image top -255%).
  - FAQ photo card (Figma 216:233): tilt -2deg (was +2), top 48px below the FAQ content, 12px in from the gap. The old inline `style="margin:0"` on the figure was removed (it was cancelling the CSS margin).
- **Nov 16, 2026:** phone frames added under the desktop rows in Figma (screenshots of the live site, see the Figma map in section 0). No site changes.
- **Nov 16, 2026 (16th round):**
  - Nav (Anne's Figma edit on landing page AC "Frame 3000"): monogram on the left, links on the right, desktop padding 60. Site: the brand link moved first in every page's `<header class="nav">` (tab order matches), `.nav` is `justify-content: flex-start` and `.brand` has `margin-right: auto`; phone = monogram left, burger right. The open phone menu now shows the monogram on top.
  - Dress code: Anne's Canva card (text + 5 swatches), see "Dress code (Nov 16" above (content section).
  - RSVP → code → RSVP: without a saved code every `a[href="rsvp.html"]` is rewritten to `invite.html?next=rsvp.html` (`common.js`), and `rsvp.html` redirects from the first line of `<head>` before it draws; the card stays hidden (`data-wait`) until `rsvp.js` has filled in the party, and the placeholder party text is gone. So no RSVP page flashes before the code page.
  - RSVP layout (Anne, Nov 16): party name, "We have reserved N seat(s) for you.", then each guest's name + Joyfully accepts / Respectfully declines (+ dietary when accepting). A party of one has no name heading (kept for screen readers, `.sr-only`). No "Your invitation" label, no numbering.
  - Mock backend: added AR-SOLO01 (Celine Zamora, one seat). New test `tools/test_rsvp_flow.py` (flow, no stray page, both layouts).
  - Figma: see "Nov 16 desktop changes" and "Editable phone frames" in section 0.
- **Nov 16, 2026 (17th round):**
  - The code page (`invite.html`) has the nav bar on desktop and phone (RSVP marked current), so guests can go back; the code screen is sized to the space under the nav (`.nav + .gate`), no extra scroll.
  - Phone menu: solid `#390007` (was 97%), every link at 100% opacity (was 75%).
  - Invite codes for Anne's Nov 16 list (54 invitations, 81 seats): `tools/anne_list_to_guests.py` now reads the 6-column layout (group, invitation, "N seats" per side), checks seats against names, and writes the codes into column J of `guests_import.csv` plus `guest_codes.csv` (both git-ignored). The codes are in Ryan's Sheet, tab "Invite codes". See "Next steps".
  - Figma: nav on the 4 desktop code frames; phone code frames + nav open rebuilt; code screenshot frames refreshed.
- **Nov 16, 2026 (18th round): one Sheet.**
  - Backend moved into Ryan's Sheet "Guest List for Wedding Website" (designer's request: no duplicate Sheets). New Apps Script project there ("Anne & Ryan wedding backend"), new web app URL in `assets/js/config.js` → `SHEETS_URL`.
  - `Code.gs`: `setupAll`, `fillGuests` (Guests from "Invite codes"), `importOldMessages` (1 letter copied from the old Sheet), `addChatMessages` (Message + Send on WhatsApp columns in "Invite codes"), "Wedding" menu (`onOpen`: send a test invite, send invites with a confirm, add new invitations, add chat messages), `sendInvites` returns its counts. Guests / How to fill tabs now go after the existing tabs.
  - No site design change, so no Figma change this round.
- **Nov 17, 2026 (19th round):**
  - Phone "RSVP sent": card lower so the couple shows (`padding-top: 220px`, photo `object-position: 50% 0`), even 40 px padding, one-line button (16 px, 2.5 px spacing, 14/24 padding). Only when the done step is showing (`:has()`), so the RSVP form doesn't move. Figma 244:564 fixed to match.
  - Our Story photos: planned (section 0), not built.
- **Nov 17, 2026 (20th round): RSVP by last name.** See section 0. Site: `rsvp.html`, `rsvp.js`, `api.js` (`find`, `forgot` removed), `common.js` (no RSVP link rewrite), `invite.html` (redirect), `invite.js` deleted, `style.css` (desktop thank-you). `Code.gs`: `find` action, invitations without codes. Figma: 216:247, 218:2, 218:231 fixed; new 262:2 + notes. Tests: `test_rsvp_flow.py` rewritten, mock `find`. Then: "RSVP" and party-name headers centred on every RSVP step (site + Figma).
- **Nov 17, 2026 (21st round): Our Story photos = one never-ending revolving strip of all 22** (section 0a). Site: `story.html`, `moments.js` (new), `style.css`. Figma: 216:86 strip of 22, phone strip 244:146.
- **Nov 17, 2026 (22nd round): Anne's "Wedding Website Part II" comments** (section 0): new hero #59, Canva logo frame, – 12.26.26 –, plain "With love,", #50, darker olive When / Where + aligned + smaller ceremony lines, 4 story pictures, gallery 7 swapped + 10 added, Details date removed, olive Wedding Day card, dress code #76 arch, RSVP #96 + Cormorant caps + new intro, FAQ Cormorant + centred without photo, Leave a Message on #51, favicon cache-bust. Figma: all matching desktop + phone frames.
- **Nov 18, 2026 (round 23):** Anne's Part III doc: new story text, RSVP hint + "Zamora" placeholder, FAQ plus one / children answers, olive pill "Write a Message", message photo fills the desktop stage, PNG favicons + apple-touch-icon (Safari), dusty rose envelope. Figma matched. Domain: DNS checked, GitHub custom domain + Namecheap redirect record left for the designer.
- **Nov 19, 2026 (round 24):** flowers recoloured pink / red / deep rose (site PNGs + Figma "Leave a Message AC"). Custom domain saved by the designer; https://www.ryannehara.com live. Still open: Namecheap URL Redirect record, Enforce HTTPS, Code.gs SITE_URL.
- **Nov 19, 2026 (round 25), deploy note:** the Pages run for commit 4dd4113 (HANDOFF only) failed in deploy-pages with "No artifacts named github-pages were found" (a GitHub glitch; the upload step had succeeded). Nothing on the site was affected; the next commit deploys again, or re-run it from the Actions tab.
- **Nov 19, 2026 (round 25):** dietary requirements optional on the RSVP (`rsvp.js`, `rsvp.html`, test). Namecheap: domain not in the designer's account, see Next steps 11. Anne's new guests: Next steps 13.
- **Nov 19, 2026 (round 26):** Anne's Part 4: "(no barong, please)", cities under Ceremony / Reception on The Details, GCash + BPI QR codes under the FAQ gift answer. Site + Figma.
- **Nov 19, 2026 (round 27):** Namecheap share accepted; redirect record already gone; waiting on GitHub's new certificate before Enforce HTTPS. Only one failed deploy so far (4dd4113, GitHub glitch); all later runs succeeded.
- **Nov 19, 2026 (round 28):** designer's final Figma pass: nav shows on scroll up (all pages), lighter olive When / Where, pink Wedding Day card with one continuous line, "Collapse bank QR" toggle, phone FAQ banner image, Leave a Message on the full photo with letters anywhere except over the text. Site + Figma.
- **Nov 19, 2026 (round 29):** FAQ bank QR codes start collapsed ("Show bank QR").
- **Nov 19, 2026 (round 30):** phone pages with little content fill the screen, Our Story photos above the text on phones, faster photo strip, centred countdowns, bank QR popup (X / overlay closes), last-name search in one request + prefetch while typing (Code.gs new version).
- **Nov 19, 2026 (round 31):** Our Story strip stopped for good on iPhones after one tap (iOS fires a fake `mouseenter` on tap and no `mouseleave`): `moments.js` now pauses only for a real mouse (`pointerenter` / `pointerleave` with `pointerType === "mouse"`). Checked in WebKit iPhone 13: keeps drifting after a tap. `moments.js?v=31`.
