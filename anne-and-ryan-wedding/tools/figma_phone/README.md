# Phone frames in Figma (editable), Nov 16

How the "… phone editable" frames on page "final pages AC" were made, so they can be rebuilt after site changes.

1. Start the site and the mock backend (`python3 -m http.server 8765`, `python3 tools/mock_apps_script.py`), then from the site folder:
   `mkdir -p /tmp/figma_phone_out && python3 tools/figma_phone/capture.py` (optional args: only some screens, e.g. `in-rsvp`).
   It opens every phone state at 390 x 844 and runs `extract.js`, which measures every element (boxes, text runs with
   font / size / colour / letter-spacing / opacity, images with their crop, icons, the tilted photo cards) into `/tmp/figma_phone_out/<screen>.json`.
2. Crop each image to exactly what is shown (object-fit / object-position / background-size), at 2x, from `assets/img`.
3. In Figma (use_figma), `build_figma.js` turns each JSON into a 390-wide frame: a frame per box ("Frame"), real text
   layers, "image" rectangles, and the two monograms copied from the file (nav Vector 216:7, pill Frame 217:2).
   The JSON was handed to Figma inside a PNG text chunk (uploaded to a temporary rectangle, read with getBytesAsync),
   then the image crops were uploaded into the returned image node ids.
Layers are absolutely placed inside each section frame (no auto-layout); text is editable, sizes are the real phone sizes.
