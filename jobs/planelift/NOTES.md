# planelift: how do planes actually stay in the air? (Batch N, worker H4, EP 68)

- Template: **#3 blueprint** (lemo-opuscar blueprint grammar, module reels/styles/blueprint, as in lock). Why: a precise mechanism plus a myth-bust: one wing section drafted on a cyanotype sheet, streamlines and air parcels computed from its geometry, a red stamp for the verdict (INCORRECT, then BOTH TRUE), and the title block's STATUS field carrying the story. STYLE_FIT: blueprint = mechanisms with precise parts (lock = 5). Previous H4 reel (knuckles) was #11.
- Length 68.6 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_planelift.js, t_planelift.html, specs/planelift.json, tl_planelift.js, ev_planelift.json.
- Copied from the demo: cyanotype sheet on drafting cloth, white linework with nib wobble, 45-degree section hatching, centre and hidden-line dash patterns, callout tags with leaders, dimension lines, the red rubber stamp, FIG. labels that are struck through and rewritten, the title block, the double-ruled NOTE box lettered on.
- Batch N layout: the title block moved to the top band (y 345-473) and the sheet's small header line dropped so the EP badge has the top-right strip; figure viewport y 540-1130; NOTE box (subtitles) y 1150-1412, x 90-900; below y 1440 only a text-free scale bar and flow arrow.
- Hook: frame 0 is the wing section with dashed streamlines and air parcels already flowing; the "LONGER PATH?" callout draws on over the top surface; title block STATUS "LONGER PATH?".
- Re-hooks: 19.7 s "Smoke tests show the top air ... reaches the back first" (parcel A beats B), 29.2 s "So what really holds up a jet?", 46.7 s "Here's the catch" (BOTH TRUE stamp). Payoff 31-60 s.
- Loop ending: the end card sits over the same wing drawing that opens the reel.
- Demand signal: "how do planes stay in the air" / "how do wings create lift" are evergreen People-Also-Ask questions; holiday travel season.
- Open question: so how do planes stay up? Answered explicitly at 31-60 s.

## Softened / not used
See sources_planelift.md (no numbers; streamlines schematic; "much of the lifting" qualitative).

## QA (python3 -I reels/qa.py planelift)
```
QA planelift: PASS   (/home/user/reel-render/jobs/planelift/planelift.mp4, 68.5 s)
  PASS  static          longest no-change run 4.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 11.1 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          68.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 11.5 (min 1.0), contrast 28.2 (min 18.0)
  PASS  9:16 frame      planelift.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history: the first draft was drawn too small (camera 1.0 -> 1.2); callouts that overlapped (AIR TURNED DOWN vs NEWTON'S 3RD LAW, INCORRECT stamp vs TOP ARRIVES FIRST) were re-timed; the title block moved down so the badge fits.

## Episode badge
`python3 -I reels/brand.py planelift --ep 68` with OVR spot ("R", 260). Frames checked at 6, 13, 17, 22, 27, 30, 34, 39, 44, 50, 57, 62, 66 s: clear of the title block, labels, stamps and the NOTE box.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (12-word first line, frame 0 subject moving, callout "LONGER PATH?", "but" at 4.4 s)
- [x] 66-86 s (68.6 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you learn the longer-path myth at school? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (end card over the opening wing drawing)
- [x] pinned_planelift.md written
- [x] planelift_ep.mp4 made with brand.py (EP 68)
- [x] Timely window: holiday travel (late Nov - Dec), otherwise evergreen

## Peer review
(pending; main session assigns a reviewer)
