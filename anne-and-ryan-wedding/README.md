# Anne & Ryan · Wedding website

Static site built from the Figma file **Anne wedding website → final pages**. Plain HTML/CSS/JS, no build step, ready for GitHub Pages. RSVPs and guest letters save to a Google Sheet.

| Page | File |
|---|---|
| Landing | `index.html` |
| Our Story (photo carousel) | `story.html` |
| Event Details + dress code | `details.html` |
| RSVP | `rsvp.html` |
| Leave a Message (write → flowers → place on arch, secret inbox) | `message.html` |

Until you connect Google Sheets, the site runs in **demo mode** (yellow badge bottom-left): everything works, but data only saves in your own browser.

---

## 1. Put it on GitHub Pages

Live: https://iamlura.github.io/anne-and-ryan-wedding/ (repo `iamlura/anne-and-ryan-wedding`). To redo it from scratch:

1. Create a new public repo on github.com.
2. Upload everything in this folder (drag the files into **Add file → Upload files**), or:
   ```bash
   git remote add origin https://github.com/iamlura/anne-and-ryan-wedding.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. After ~1 minute the site is live at `https://iamlura.github.io/anne-and-ryan-wedding/`.

Custom domain (optional): Settings → Pages → Custom domain, then add a CNAME record at your domain provider pointing to `<you>.github.io`.

## 2. Connect Google Sheets (RSVPs + letters)

1. Create a Google Sheet (e.g. "Anne & Ryan wedding").
2. **Extensions → Apps Script**. Delete the sample code and paste all of `apps-script/Code.gs`. Save.
3. In the function dropdown pick **setup** → **Run** → approve the permissions. This creates the `RSVP` and `Messages` tabs and stores the inbox password (`261226`).
4. **Deploy → New deployment** → type **Web app** → Execute as **Me**, Who has access **Anyone** → Deploy → copy the URL ending in `/exec`.
5. Paste it into `assets/js/config.js`:
   ```js
   SHEETS_URL: "https://script.google.com/macros/s/XXXX/exec",
   ```
6. Commit/upload `config.js` again. The demo badge disappears.

If you edit `Code.gs` later: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** (same URL keeps working).

## Secret inbox (for Anne)

On **Leave a Message**, tap the "Leave a Message" title (or the nav link) **5 times** → password **261226** → browse every letter, click an envelope to open it, download one or all as PDF.

- Password is checked in Apps Script, not in the browser. Change it in `Code.gs → setPassword()` and run it.
- Message text is never sent to guests; the public arch only gets names, bouquets and positions.

## Moderation

- A word filter (English + Filipino) blocks inappropriate names/messages in the browser **and** in Apps Script. List: `assets/js/filter.js` and `BAD_WORDS` in `Code.gs` (keep both in sync).
- To remove a letter: in the `Messages` sheet set **hidden** to `TRUE`. It disappears from the arch and the inbox.

## Editing content

- Text lives directly in the HTML files.
- Photos are in `assets/img/` (same file name = drop-in replacement). Keep photos under ~1800px on the long side.
- Our Story captions: `story.html`, one `<figure class="story-card">` per photo.
- Max flowers / message length: `assets/js/config.js`.

## How the arch works

Each letter stores a position along the arch line (0 = bottom-left, 1 = bottom-right). When guests place a letter, it snaps to the nearest point on the line; other letters slide along the line to make room (`assets/js/notes.js → layout`). Everyone sees the same arrangement.
