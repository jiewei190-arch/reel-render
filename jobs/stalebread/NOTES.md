# stalebread: why does bread go stale? (Batch N, worker H4, EP 95)

- Template: **#18 handdrawn "Japan heat wave"** (fieldbook kit, the earpop grammar; reserved by the main session; last used for feetasleep EP 80). Why: a mechanism you can draw as a field-notebook cross-section with measurements: the crumb's starch field, a firmness-over-days chart, measurement boxes.
- Length 70.8 s (spec tail 0.7, end card about 3 s); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_stalebread.js, t_stalebread.html, specs/stalebread.json, tl_stalebread.js, ev_stalebread.json.
- Copied from the demo/earpop: warm sketchbook paper, pencil linework with wobble, pattern hatching (ochre crust, graphite, navy crystals, a red hatched sun), mono chapter labels "NO. 0x — ..." with handwritten heads, measurement boxes with mono labels, the demo's line chart, red round seals, leader-line notes, page dissolves, the page footer, a slow push-in per page, a text-free strip of tiny loaves under the captions.
- One state function draws the magnified starch field on every page: raw grains -> swollen with water -> soft gel strands -> stiff crystal blocks (retrogradation; water dots migrating into them) -> gel again under the toaster -> crystals returning.
- Batch N layout: chapter label y 300, head y 405 (clear of the top-right badge), drawings y 440-1180, captions y 1235-1420, text-free strip at y 1510, nothing written in the right column below y 840.
- Hook: frame 0 is the loaf sealed in a dashed airtight bag over a red hatched sun, crumbs falling, a magnifier on the crumb where crystal blocks pulse; "Stale ≠ dried out"; "but" at 2.9 s.
- Re-hooks: 23.6 s "a loaf wrapped airtight still goes stale ... the starch grabbed it", 29.7 s "Here's the twist: the fridge makes it worse" (1 day = 6 days boxes), 43.8 s "you can undo it, for a while" (toaster).
- Demand signal: "why does bread go stale" / "should you refrigerate bread" are evergreen searches.

## Softened / not used
See sources_stalebread.md (reheating sourced to America's Test Kitchen only; no temperatures).

## QA (python3 -I reels/qa.py stalebread, handoff qa.py)
```
QA stalebread: PASS   (/home/user/reel-render/jobs/stalebread/stalebread.mp4, 70.8 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.5 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 12.0 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          70.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 8.2 (min 1.0), contrast 19.4 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      stalebread.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history: the first build FAILed static (pages held still 5.75 s) and frame-0 contrast (16.7): added a slow push-in on every page, a marker riding the chart curves, a dot circling the summary, falling crumbs, a jiggling crystal magnifier, and a red hatched sun behind the hook loaf. Layout: the question box moved off the loaf; the freezer inset moved off the chart labels.

## Episode badge
`python3 -I reels/brand.py stalebread --ep 95` (auto spot 651,260, busy 1.4). Frames checked at 6, 9, 14, 19, 24, 27, 31, 35, 40, 45, 50, 55, 60, 66 s: clear of the seals and heads.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (6-word first line, frame 0 subject moving, "but" at 2.9 s)
- [x] 66-86 s (70.8 s); ends on the exact closing line; end card about 3 s
- [x] One-word-answer question before the closing line ("Do you keep your bread in the fridge? Yes or no?", fridge/counter/freezer boxes)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (the last 0.7 s dissolves back toward the hook page)
- [x] pinned_stalebread.md written
- [x] stalebread_ep.mp4 made with brand.py (EP 95)
- [x] Evergreen (holiday baking season)

## Peer review
(pending; main session assigns a reviewer)
