#!/usr/bin/env python3
"""Turn Anne's guest list into rows for the Guests tab of the Sheet.

    python3 tools/anne_list_to_guests.py anne_list.csv  ->  tools/guests_import.csv

anne_list.csv = Anne's sheet "Guest List for Wedding Website" (File > Download > .csv).
Her layout: A = group on Anne's side (only on the first row of a group), B = one invitation per cell
("John Doe and Jane Doe", "A, B, C and D", "... and Plus One"); C / D = the same for Ryan's side.

Output: one row per guest in the Guests-tab columns (Party = the cell text, e.g. "John Doe and Jane Doe";
a "Plus One" seat is its own row named "Plus One"; Notes = side and group). Import it into the Guests tab
(File > Import > Upload > "Append to current sheet"), add the emails, then run makeCodes and sendInvites
in Apps Script. CSVs stay out of git (tools/*.csv is in .gitignore).
"""
import csv, os, re, sys

HEAD = ["Party", "Guest name", "Email", "Seats reserved", "Plus-one allowed", "Child", "Invited to", "Table", "Notes"]

def main(src):
    rows = list(csv.reader(open(src, newline="", encoding="utf-8")))
    groups = ["", ""]; out = []
    for row in rows:
        row = (row + [""] * 4)[:4]
        for side, (gc, nc) in enumerate([(0, 1), (2, 3)]):
            g, cell = row[gc].strip(), row[nc].strip()
            if g: groups[side] = g
            if not cell or not groups[side]: continue
            names = [n.strip() for n in re.split(r",\s*|\s+and\s+", cell) if n.strip()]
            plus = any(n.lower() == "plus one" for n in names)
            for k, n in enumerate(names):
                out.append([cell, "Plus One" if n.lower() == "plus one" else n, "", len(names) if k == 0 else "",
                            "Yes" if plus else "No", "No", "Ceremony & Reception", "", f"{'Anne' if side == 0 else 'Ryan'} · {groups[side]}"])
    dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "guests_import.csv")
    with open(dst, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(HEAD); w.writerows(out)
    parties = len({r[0] for r in out})
    print(f"{parties} invitations, {len(out)} seats -> {os.path.relpath(dst)}")

if __name__ == "__main__":
    if len(sys.argv) != 2: sys.exit(__doc__)
    main(sys.argv[1])
