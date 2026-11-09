# Handoff: Anne & Ryan wedding site

This file explains how the site was made, step by step, so you can rebuild it the same way or keep working on it.

- **Live site:** https://iamlura.github.io/anne-and-ryan-wedding/
- **Repo:** https://github.com/iamlura/anne-and-ryan-wedding
- **Figma:** https://www.figma.com/design/pAVTZMkGiY9VYrzp7IeVJO/Anne-wedding-website?node-id=87-64447 (page "final pages")

## Status (updated Nov 9, 2026, 11th round)

| | |
|---|---|
| Site | Live on GitHub Pages since Oct 8, 2026. All 5 pages and the full message flow work. |
| Data | **Live since Nov 8.** RSVPs go to the Google Form "Anne & Ryan · RSVP"; letters go to the Google Sheet "Anne & Ryan wedding" through Apps Script. Both are in the designer's Google account (jaeyoung.laura@gmail.com); she shares them with Anne. Links in section 7. |
| Waiting on the designer | New content and some design changes are coming (the site is set up for this, see "Changing content" below). |
| Figma vs site | In sync as of Nov 9 (11th round). New guest-login screens are in Figma only (draft, waiting for the designer's OK). The starred original frames on "final pages" are the reference. |
| Code changes since launch | **Nov 4:** type scale, landing updates, Event Details redesign, shared content file. **Nov 4 (2nd round):** matched the designer's own updated frames (Event Details, Our Story, RSVP, Leave a Message 7/8, landing prenup + footer); Dec 26 everywhere in Figma. **Nov 4 (3rd round):** one button style everywhere, guests can delete their own letter. **Nov 4 (4th round):** every footer = "Thank you" + RSVP button (nav links removed again), all carousel cards 440 wide with 400×600 photos, prenup photos link to the Our Story carousel, new green tuxedo photo. **Nov 8 (5th round):** all info matched to the printed invitation (2:30 PM, Minor Basilica of San Sebastian, reception at Champagne Room, RSVP by Dec 5), new dress code with color swatches, new Reception / Parking / Kindly Note / Gifts section. **Nov 8 (6th round):** invitation fonts undone (back to Afacad / Playfair / Carattere), Event Details background image removed. **Nov 8 (7th round):** story cards all the same height, RSVP sub-headings in Playfair, Google Form for RSVPs + Sheets connected for letters. **Nov 8 (8th round):** envelopes on the right half of the arch tilt the mirror way, guest delete removed. **Nov 8 (9th round):** on "Place your letter" the letter starts in the middle. **Nov 9 (10th round):** Anne's new AR monogram everywhere; Guests tab in the Sheet; draft Figma screens for guest login (invite code, party RSVP, email). **Nov 9 (11th round):** phone form text (RSVP + message inputs, radio answers) 32 → 24 px; "final pages" rearranged in flow order with two new screens (wrong code, RSVP sent). Details in section 9. |

---

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
| Event Details (also named "Our Story" in Figma) | 87:64649 | 87:112817 | 94:94 / 95:89 |
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

- **Fonts (Google Fonts):** Afacad (UI / sans), Playfair Display (serif), Playfair Display SC (brand + calendar numbers), Carattere (script: footer, signature, envelope). A switch to the invitation fonts (Cormorant Garamond + Pinyon Script) was tried on Nov 8 and undone the same day at the designer's request.
- **Colors:** page bg `#efefef`; story bg `#e0e0e0`; story card `#e7e7e7`; input/field `#e1e1e1`; black `#000`; envelope body `#c7b8d4`, flap `#9a80b0`, stroke `#898989`; RSVP radio on `#b4fff9`, off ring `#8f8f8f`; carousel arrow bg `#d1d1d1`, chevron `#393939`; inbox Close button `#8a8a8a`.
- **Scaling:** `--u: clamp(0.5px, 0.0520833vw, 1px)`, so 1 Figma px = 1px at 1920 wide. Every size is `calc(N * var(--u))` with N copied from Figma. Mobile (≤760px) uses explicit px from the 402 frames.
- **Type scale (Nov 2026, set by the designer on the landing page).** CSS variables at the top of `style.css`, mobile values in the ≤760px block. Change one and every page follows:

| Variable | Used for | Desktop | Mobile |
|---|---|---|---|
| `--fs-title` | page titles, hero name | 60 | 40 |
| `--fs-head` | landing section headings (Prenuptial Photos, A message from the couple) | 48 | 32 |
| `--fs-val` | Event Details values (location/time/date) | 40 | 32 |
| `--fs-input` | form inputs, RSVP radios, message box | 32 | 24 |
| `--fs-item` | landing timeline items, "in a glance" | 40 | 28 |
| `--fs-body` | body + intro copy, Event Details sub-headings (Itinerary, Dress Code, gown/barong), story captions, letter | 32 | 24 |
| `--fs-label` | small labels, dress notes | 32 | 18 |
| `--fs-btn` / `--btn-track` | every button, "Write a Message" style: hugs its text, padding 20/60 (mobile 16/40), white 1px outline, gray #898989 for Close/Cancel | 32 / 20% | 24 / 20% (inbox 18) |
| `--fs-nav` | nav | 24 | 26 (menu) |

  One-offs from the designer's frames: itinerary items on Event Details are Playfair 38; "The Wedding Day" uses `--fs-title` on desktop but 32 on mobile; mobile venue name is Playfair 32 (desktop is Afacad 60); mobile Dress Code title is Afacad 40, centred; Reception / Parking / Kindly Note / Gifts headings are Playfair (`--fs-body` on desktop, `--fs-head` centred on mobile), their text is Afacad on desktop and Playfair on mobile (same as the dress code text). Footer stays Carattere 80/40 (mobile 36/24); mobile footer text is left-aligned.
- **Other sizes (desktop):** nav 161 gap, 80 tall; footer (every page, same as the landing footer): padding 120, gap 40, "Thank you" block + RSVP button, ~503 tall; mobile footer: padding 37/52, gap 30, left-aligned; story cards 440 wide (400×600 photo, padding 20, gap 10, height hugs the caption); page padding 260 top, 200 sides.
- **Overlays:** landing hero photo opacity .4 on black; venue cathedral .3; Event Details has no background image (removed Nov 8, too busy); RSVP photo blur 20px CSS (Figma layer blur 40) + 50% black.

## 5. Code map

Repo layout: `.github/workflows/pages.yml` at the root, everything else inside `anne-and-ryan-wedding/`. Paths below are relative to that folder.

```
index.html  story.html  details.html  rsvp.html  message.html
assets/css/style.css     all styles, type scale tokens, mobile overrides
assets/js/content.js     shared wedding facts (date, time, venue, itinerary, RSVP deadline)
assets/js/config.js      SHEETS_URL, MAX_FLOWERS, MAX_MESSAGE
assets/js/api.js         Sheets client (text/plain POST to dodge CORS preflight) + demo fallback
assets/js/filter.js      bad-word filter (EN + Filipino)
assets/js/common.js      mobile menu, fade-ins, story carousel, toast, demo badge
assets/js/notes.js       envelope/bouquet renderer, arch geometry, overlap layout
assets/js/message.js     message steps, flower drag/drop, arch placement, secret inbox, PDF
assets/js/rsvp.js        RSVP validation + submit
apps-script/Code.gs      Google Apps Script backend
tools/                   asset scripts + Playwright tests + mock backend
```

### Changing content (info is expected to change)
- **Date, time, venue, itinerary, RSVP deadline:** edit `assets/js/content.js` only. Elements with `data-c="..."` on the landing, Event Details and RSVP pages are filled from it, and the landing calendar strip (Sun–Sat around the date) is rebuilt automatically. The HTML keeps the same text as a no-JS fallback, so update it too when convenient.
- **Not covered by content.js** (edit the HTML directly): page `<title>` / meta description in `index.html` (contain the date), the couple's message, story captions (`story.html`), dress code text and photos (`details.html`), RSVP form labels.
- **Sizes:** change the type-scale variables (section 4), not individual rules.

**Invitation source (Nov 8):** the couple's printed invitation (Main Invite Card, Details Cards, RSVP Card PDFs, emailed by Anne Marie Zamora on Nov 8). Facts used: Saturday 26 December 2026; ceremony 2:30 PM at the Minor Basilica of San Sebastian, Quiapo, Manila; reception to follow at Champagne Room, The Manila Hotel (cocktail hour and dinner); kindly reply by Dec 5, 2026; dress code, parking, kindly note and gifts text copied word for word.

**Dress code swatches:** 10 circles from the invitation. Flat colors are CSS backgrounds (#ceae7e, #bc8269, #846555, #9a5657, #610e08, #3f1521); the 4 prints are `assets/img/swatch-1/2/6/7.webp`, cropped from the invitation PDF. Desktop 120px circles with an 8px white ring, gap 24, left-aligned; mobile 56px, ring 4, gap 12, centred. The old dress photos (`dress-*.jpg`) are no longer used on the page but are still in `assets/img`.

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
- **Check a deploy:** about a minute after the commit, compare the live files with your local copies (e.g. `curl -s https://iamlura.github.io/anne-and-ryan-wedding/assets/css/style.css | sha256sum`).
- **Copies outside GitHub:** the designer's `Downloads\anne-and-ryan-wedding` folder (may be older). GitHub is the source of truth.
- **Google Sheets + Form (connected Nov 8, designer's account jaeyoung.laura@gmail.com):**
  - Sheet "Anne & Ryan wedding": https://docs.google.com/spreadsheets/d/1oapFYPqkLcdA2HVhomGbhMsxTLJFqUznyo01xG-Pj1E/edit (tabs: `Form Responses 1` = RSVPs, `Messages` = letters, empty `Sheet1`).
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
5. **Sharper flowers (optional):** re-export the flowers from Figma with the background hidden instead of keying it out.

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
