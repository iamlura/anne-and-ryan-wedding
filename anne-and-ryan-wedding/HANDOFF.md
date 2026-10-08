# Handoff: Anne & Ryan wedding site

This file explains how the site was made, step by step, so you can rebuild it the same way or keep working on it.

- **Live site:** https://iamlura.github.io/anne-and-ryan-wedding/
- **Repo:** https://github.com/iamlura/anne-and-ryan-wedding
- **Figma:** https://www.figma.com/design/pAVTZMkGiY9VYrzp7IeVJO/Anne-wedding-website?node-id=87-64447 (page "final pages")

---

## 1. Brief and decisions

The designer shared the Figma link and asked for it to be built as a website, with clarifying questions first. Answers:

| Question | Answer |
|---|---|
| Build as | GitHub (static site on GitHub Pages, plain HTML/CSS/JS, no framework, no build step) |
| Backend for RSVPs + letters | Google Sheets via Apps Script (the Figma annotation suggested this) |
| Wedding date (Figma conflict: landing says Dec 26, Event Details says Dec 25) | **Dec 26, 2026** (matches the 261226 password) |
| Scope | Everything, including the full message flow, secret inbox and PDF download |
| Repo name | anne-and-ryan-wedding |

Designer preferences to follow: keep explanations brief; match the Figma exactly; don't add things that aren't in the design without saying so.

## 2. Figma map

Desktop frames are 1920 wide, mobile frames are 402 wide. Node IDs:

| Screen | Desktop | Mobile |
|---|---|---|
| Landing | 87:64448 | 87:112649 |
| Our Story | 87:64558 | 87:112730 |
| Event Details (also named "Our Story" in Figma) | 87:64649 | 87:112817 |
| RSVP | 87:64724 | 87:112888 |
| Leave a Message (arch, empty) | 87:64796 ("Leave a Message 4") | 87:112929 |
| Write a message | 87:64767 ("Leave a Message 1") | 87:159001 |
| Make your arrangement | 87:111834 ("Leave a Message 2") | 87:159025 |
| Place your letter | 87:103999 ("Leave a Message 5") | 87:151171 |
| Arch with new letter | 87:72163 ("Leave a Message 6") | 87:120291 |
| Secret inbox: envelope | 87:87833 | 87:135951 |
| Secret inbox: open letter | 87:96149 | 87:143794 |

Key asset nodes: arch = Group 817 (87:64805), flowers = 87:111843 / 87:111937 / 87:112031, envelope = Frame 789 (87:96118).

### Figma annotations, and how each was built
| Annotation (text in Figma) | Implementation |
|---|---|
| all nav bars are static, current page opacity 100%, other page opacity 60% | `.nav` is `position:absolute` (not sticky); `aria-current="page"` gets opacity 1, the rest .6 |
| light bg change nav bar text to black | `.nav--light` (white text) only on landing + RSVP |
| s1 fade in / s2 snap scroll and fade in / s3 snap scroll and fade in (Event Details) | `[data-fade]` + IntersectionObserver; `html.snap-y` uses `scroll-snap-type: y proximity` |
| we might need google sheets extension for RSVP | `apps-script/Code.gs` |
| submit opacity 50% if fields not complete | button `disabled` → `opacity:.5`; food required only when attending = Yes |
| may change content* (RSVP copy) | copy kept as designed |
| overflow = scroll (message box / letter) | textarea + `.letter` have `overflow-y:auto` |
| [add font / text size / emoji picker] | toolbar: Classic/Modern/Script font, A− A A+, emoji popover |
| 50% opacity if both fields not finished, no inappropriate content | Next disabled until name + message; `filter.js` + server check |
| drag flowers, max 4, allow delete | pointer-event drag from the palette; drag off the envelope or × to delete |
| user can go next without flowers | Next is always enabled on the arrange step |
| drag letter; if dropped outside the arch it snaps to the nearest line; no overlap, other notes move to make space | `notes.js`: `nearestS()` projects onto the arch path; `layout()` (pool-adjacent-violators) spreads notes with minimum movement; neighbours slide live while dragging |
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

- **Fonts (Google Fonts):** Afacad (UI / sans), Playfair Display (serif), Playfair Display SC (brand + calendar numbers), Carattere (script: footer, signature, envelope).
- **Colors:** page bg `#efefef`; story bg `#e0e0e0`; story card `#e7e7e7`; input/field `#e1e1e1`; chip border `#7d7d7d`; black `#000`; envelope body `#c7b8d4`, flap `#9a80b0`, stroke `#898989`; RSVP radio on `#b4fff9`, off ring `#8f8f8f`; carousel arrow bg `#d1d1d1`, chevron `#393939`; inbox Close button `#8a8a8a`.
- **Scaling:** `--u: clamp(0.5px, 0.0520833vw, 1px)`, so 1 Figma px = 1px at 1920 wide. Every size is `calc(N * var(--u))` with N copied from Figma. Mobile (≤760px) uses explicit px from the 402 frames.
- **Common sizes (desktop):** headings 120 Afacad; section titles 60 Playfair; body 32; nav 26 with 161 gap, 80 tall; buttons 70 Afacad, tracking 7 (hero RSVP: tracking 14); footer 291 tall, Carattere 80/40; page padding 260 top, 200 sides.
- **Overlays:** landing hero photo opacity .4 on black; venue cathedral .3; Event Details cathedral .1 with `mix-blend-mode: exclusion`; RSVP photo blur 2px + 50% black.

## 5. Code map

```
index.html  story.html  details.html  rsvp.html  message.html
assets/css/style.css     all styles, tokens, mobile overrides
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

**Data model:** a letter is `{id, t, from, text, font: serif|sans|script, size: s|m|l, flowers: [{f:1-3, x, y, r}], pos: 0..1}`. Flower x/y are fractions of the 1000×900 note box (y is the stem bottom); `pos` is the fraction along the arch (0 = bottom-left, 1 = bottom-right). The public `notes` endpoint never returns `text`.

**Arch geometry** (units of the 1920×1652 artwork): circle center (960, 988.658), radius 822.945, left line x 137.055, right line x 1782.95, usable bottom y 1540. Note width = 13.3% of the stage (min 72px), minimum spacing = 72% of note width.

## 6. Verification (run before every deploy)

```bash
python3 -m http.server 8765                         # from repo root
cd tools && python3 screenshots.py index,story,details,rsvp,message 1440
python3 screenshots.py index,story,details,rsvp 402
python3 test_message_flow.py                        # desktop; W=402 for mobile
python3 mock_apps_script.py & python3 test_backend_flow.py
```

Compare the screenshots against the Figma frames at the same widths. The flow test seeds 9 letters, writes one, drags 5 flowers (checks the max of 4), drags the letter onto the arch, sends, opens the inbox with a wrong and then the right password, opens a letter and downloads a PDF.

## 7. Deploy (how it is set up now)

- The repo keeps the site inside a subfolder: `anne-and-ryan-wedding/` (that's how the folder was dragged into GitHub's web uploader).
- Pages deploys with GitHub Actions, not "deploy from branch": `.github/workflows/pages.yml` uploads the `anne-and-ryan-wedding/` folder on every push to `main`. Settings → Pages → Source = **GitHub Actions**.
- So any commit to `main` redeploys the site in about 30 seconds. Check progress in the Actions tab.
- Live URL: https://iamlura.github.io/anne-and-ryan-wedding/
- To edit: change the files under `anne-and-ryan-wedding/` on GitHub (pencil icon) or locally, then commit to `main`.
- **Google Sheets** (not connected yet, the site is in demo mode): see README §2. Create the Sheet → Apps Script → paste `Code.gs` → run `setup` → Deploy as web app (Me / Anyone) → paste the `/exec` URL into `anne-and-ryan-wedding/assets/js/config.js` → commit.

## 8. Open items

1. Connect Google Sheets (above) and test once with the real URL. So far it was tested only against `tools/mock_apps_script.py`.
2. Confirm these interpretations with the designer:
   - "See Prenuptial Photos" goes to the Our Story carousel.
   - The mobile hamburger menu has no Figma design (built as a black overlay).
   - Note tilt on the arch is automatic.
   - Food restrictions are optional when not attending.
3. For sharper flowers, re-export them from Figma with the background hidden instead of keying it out.
