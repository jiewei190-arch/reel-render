# NOTES: hairgray (EP 77)

**Template:** #27 old-master painting (demo t27, x.com/AdornCurates "Netherlandish Proverbs"). No kit existed, so this is custom code: reels/t_hairgray.js.

**Demo grammar reused:**
- slow push-ins and pans on real public-domain paintings;
- parchment title cards (serif small caps + italic line);
- dotted circle callouts;
- two little guide characters in the lower corners (one points with a stick, one reacts in a bubble);
- karaoke subtitles with gold key words on a dark pill.

**Images:** The Met Open Access (CC0) — Rembrandt, Self-Portrait 1660 (437397), plus "style of Rembrandt" Rembrandt as a Young Man (437419) and Study Head of an Old Man (437421). They are in reels/assets/hairgray/. The biology is drawn as sepia study sheets laid over the painting.

**Why:** a question about aging, told on the most famous aging face in art. The grey curls of the 1660 self-portrait are the hook image.

**Shots:**
- push-in on the grey curls ("grows in gray");
- young | older split;
- melanin/melanocytes sheet (zoom on the bulb, then wide as the hair grows);
- young hair vs the old man's white beard;
- stem-cell sheet with camera moves:
  - wide;
  - the bulge/germ shuttle;
  - the germ's pigment signal;
  - zoom on cells stuck in the bulge;
  - wide as the white hair grows;
- H₂O₂ blocks tyrosinase (Wood 2009);
- mouse with noradrenaline (Zhang 2020);
- "in people?" pull-back;
- genes triptych;
- yes/no;
- end card on parchment.

**Human claims softened:** the stem-cell and stress studies are labelled "in mice" on screen and in the voice. "Whether it works the same way in people is still being studied."

**Batch N layout:**
- painting window y 260-1160;
- karaoke centred at y 1300;
- guides inside the window's bottom corners.

**Build notes:**
- I added camera moves to the study sheets after the first render, because the follicle drawing held for about 20 s (main-session check).
- I moved the "color set as it grows" label off the hair shaft.

**QA:** no FAIL. Two WARNs come from the zoomed parchment: it reaches the outer 24 px, and it is in the right column at 26-32 s. There is no text in either zone, only paper and the edge of the follicle drawing.

**Voice:** af_heart 0.97, jazz bed at music_gain 0.55, 75.1 s (spec `tail` 0.5, so the end card runs 2.95 s, per RETENTION.md); "2023" is spoken as "twenty twenty-three".

**Sources:** sources_hairgray.md.

**Code:** reels/t_hairgray.js, t_hairgray.html, specs/hairgray.json, ev_hairgray.json, tl_hairgray.js.

**Thumbnail:** thumb_hairgray.jpg.

**Badge:** `brand.py hairgray --ep 77` at ("R", 256), hidden 16.2-20.3 s under the "Study Head of an Old Man" card; checked at 13 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 77)
- [x] Hook passes HOOKS.md (9 words; frame 0 is a push-in on Rembrandt's grey curls with a callout; search question at 3.6 s)
- [x] 66-86 s (75.1 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you found your first gray hair yet? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 40%, back to the self-portrait)
- [x] pinned_hairgray.md written
- [x] hairgray_ep.mp4 (EP 77)
- [x] Evergreen

## QA (python3 -I reels/qa.py hairgray), final render with the 2.95 s end card
```
QA hairgray: WARN   (/home/user/reel-render/jobs/hairgray/hairgray.mp4, 75.0 s)
  PASS  static          longest no-change run 3.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.0 s)
  WARN  safe zones      right x>900 y900-1650: content 26.5-31.8s, 37.5-40.8s
  WARN  outer 24 px     content at the frame edge 6.8-12.2s, 22.2-41.5s
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.3 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.6 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          75.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.3 (min 1.0), contrast 40.6 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      hairgray.mp4 1080x1920 SAR 1:1; hairgray_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
