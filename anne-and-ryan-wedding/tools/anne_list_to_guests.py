#!/usr/bin/env python3
"""Turn Anne's guest list into rows for the Guests tab of the Sheet, with an invite code per invitation.

    python3 tools/anne_list_to_guests.py anne_list.csv  ->  tools/guests_import.csv + tools/guest_codes.csv

anne_list.csv = the sheet "Guest List for Wedding Website" (File > Download > .csv). Both layouts work:
  6 columns (Nov 16): A group · B invitation · C "2 seats"  |  D group · E invitation · F seats   (A-C Anne, D-F Ryan)
  4 columns (Nov 15): A group · B invitation                |  C group · D invitation
A group name is only on the first row of a group. An invitation is one cell: "John Doe and Jane Doe",
"A, B, C and D", "... and Plus One". A "Plus One" seat becomes its own row named "Plus One".

Codes: AR- + 6 characters from Code.gs CODE_CHARS (no 0/O, 1/I/L), one per invitation. Codes already in
tools/guests_import.csv are kept for the same invitation, so re-running never changes a code that was sent.
Code.gs makeCodes also keeps any code that is already filled in.

guests_import.csv: the Guests-tab columns A-J (Party ... Notes, Invite code). Import into the Guests tab
(File > Import > Upload > "Append to current sheet"), add emails, then sendTestInvite / sendInvites.
guest_codes.csv: one row per invitation (side, group, invitation, guests, seats, code, link) for the "Invite codes" tab.
CSV files stay out of git (tools/*.csv in .gitignore): they hold guests' names.
"""
import csv, os, re, secrets, sys

HEAD = ["Party", "Guest name", "Email", "Seats reserved", "Plus-one allowed", "Child", "Invited to", "Table", "Notes", "Invite code"]
CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
SITE = "https://iamlura.github.io/anne-and-ryan-wedding/"
HERE = os.path.dirname(os.path.abspath(__file__))

def invitations(rows):
    six = any(re.fullmatch(r"\d+\s+seats?", (c or "").strip()) for r in rows for c in r)
    cols = [(0, 1, 2), (3, 4, 5)] if six else [(0, 1, None), (2, 3, None)]
    groups = ["", ""]; out = []
    for row in rows:
        row = (row + [""] * 6)[:6]
        for side, (gc, nc, sc) in enumerate(cols):
            g, cell = row[gc].strip(), row[nc].strip()
            if g: groups[side] = g
            if not cell or not groups[side]: continue
            names = [n.strip() for n in re.split(r",\s*(?:and\s+)?|\s+and\s+", cell) if n.strip()]
            seats = int(re.match(r"\d+", row[sc].strip()).group()) if sc is not None and re.match(r"\d+", row[sc].strip()) else len(names)
            if seats != len(names): print(f"  check: '{cell}' lists {len(names)} names but says {seats} seats", file=sys.stderr)
            out.append(("Anne" if side == 0 else "Ryan", groups[side], cell, names, seats))
    return out

def main(src):
    rows = list(csv.reader(open(src, newline="", encoding="utf-8")))
    dst = os.path.join(HERE, "guests_import.csv")
    old = {}
    if os.path.exists(dst):
        for r in csv.DictReader(open(dst, newline="", encoding="utf-8")):
            if r.get("Invite code"): old[r["Party"]] = r["Invite code"]
    used = set(old.values()); out = []; tab = []
    for side, group, cell, names, seats in invitations(rows):
        code = old.get(cell)
        while not code or (code in used and old.get(cell) != code):
            code = "AR-" + "".join(secrets.choice(CODE_CHARS) for _ in range(6))
        used.add(code)
        plus = any(n.lower() == "plus one" for n in names)
        for k, n in enumerate(names):
            out.append([cell, "Plus One" if n.lower() == "plus one" else n, "", seats if k == 0 else "",
                        "Yes" if plus else "No", "No", "Ceremony & Reception", "", f"{side} · {group}", code])
        tab.append([side, group, cell, len(names), seats, code, SITE + "invite.html?code=" + code])
    with open(dst, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(HEAD); w.writerows(out)
    with open(os.path.join(HERE, "guest_codes.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["Side", "Group", "Invitation", "Guests", "Seats", "Invite code", "Invite link"]); w.writerows(tab)
    print(f"{len(tab)} invitations, {len(out)} seats, {len(set(t[5] for t in tab))} unique codes -> tools/guests_import.csv, tools/guest_codes.csv")

if __name__ == "__main__":
    if len(sys.argv) != 2: sys.exit(__doc__)
    main(sys.argv[1])
