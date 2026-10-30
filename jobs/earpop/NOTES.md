# earpop: why do your ears pop on a plane? (Batch N, worker H4, EP 44)

- Template: **#18 handdrawn "Japan heat wave"** (demo 101), module reels/styles/fieldbook. Why: a pressure mechanism with numbers and a cross-section, which is the demo's engine (pencil section + chart + rain-gauge cylinders + measurement boxes + red seals). The ear section is drawn from one state function: eardrum bulge and the density of pressure dots (red = cabin, navy = middle ear) follow the pressure story; the tube opens on each swallow and a bubble travels through it. My previous reels were owl (#20 crayon) and darkeyes (#16), so no repeat.
- Length 77.1 s; af_heart 0.97; music crayon 88 bpm; fx_gain 0.5 (mix2 default).
- Code: reels/t_earpop.js, t_earpop.html, specs/earpop.json, tl_earpop.js, ev_earpop.json. New helper: reels/storyboard.py (6-still storyboard, rule 17a).
- Copied from the demo: field-sketchbook paper with crop marks, mono chapter labels with rule, Kalam handwritten heads, pencil line work drawing on, red/navy/graphite hatching, the big red hatched sun behind the hook drawing, the chart (here the flight profile: plane vs cabin altitude), paired gauge cylinders (ground vs cabin ≈ ¾), double-ruled measurement boxes (CABIN % vs MIDDLE EAR %, TUBE OPEN/SHUT), red round seals (EAR, POP, DOWN, END), mono footer with swatch chips.
- Batch N layout: chapter label y 300, heads y 405, drawings y 440-1130, captions y 1235 (up to 3 lines), a text-free mini flight profile with the plane riding the story at y 1450-1570; nothing important at x > 900 below y 840. Chapter labels shortened (no "fig." suffix) so the EP badge (top-right, 651,260) never touches them.
- Hook: frame 0 is the ear section on the red sun with a bubble already squeezing up the tube and popping (loops every 2.6 s), headline "That pop is a bubble of air." The search question is spoken in line 2 and written in a box at 4-8 s.
- Re-hooks: 25.1 s "only about three quarters" (gauges), 46.0 s "Here's the catch" (tube close-up, shut tight). Payoff 55-60 s (swallow, yawn, chew: tube opens, air in, POP, 100% = 100%).
- Loop ending: in the last 0.7 s the frame-0 page dissolves in at most 50%, so the replay flows on.
- Demand signal: "why do my ears pop on a plane" and "why do ears hurt when landing" are standard People-Also-Ask/autocomplete questions; timely for Thanksgiving and holiday travel (late Nov-Dec).
- Open question: why do ears pop on planes, and why is landing worse? Answered explicitly at 46-60 s.

## Softened / not used
See sources_earpop.md: no flutter-valve claim (secondary only), "three quarters" = the 8,000 ft figure, no decongestant/Valsalva advice (health topic: educational only).

## QA (python3 -I reels/qa.py earpop), v2
```
QA earpop: PASS   (/home/user/reel-render/jobs/earpop/earpop.mp4, 77.0 s)
  PASS  static          longest no-change run 3.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.0 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          77.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.7 (min 1.0), contrast 20.2 (min 18.0)
  PASS  9:16 frame      earpop.mp4 1080x1920 SAR 1:1; earpop_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history: first render failed "static" (5.75 s at 9.8-15.5 s and others); fixed with bigger pressure-dot jitter, sound waves in the canal, a bobbing plane on the strip, air bubbles in the baby tubes and a slow push-in on pages 2 and 8.

## v2 (main-session notes, Oct 28)
- Frame 0 "on a plane" cue: an airliner window with clouds sliding past and a seatbelt sign beside the ear section; the eardrum is already flexed inward at t=0 (hook loop).
- The text-free flight-profile strip (y 1450-1570) is gone from the bottom UI zone; the flight profile still appears on pages 3, 6 and 8 in the middle area. To keep qa's static check, pages 2, 5 and 8 get a slow 10% push-in.
- Captions: each caption already fits within its 800 px box (pre-wrapped); the mid-word frames were the typewriter reveal. It now types at 120 characters/s (was 46), so a caption is complete within about 1 s.
- Medical tips: swallow/yawn/chew are sourced to MedlinePlus (US National Library of Medicine), Stony Brook ENT and KidsHealth. NHS pages (ear-barotrauma, ear-problems-from-flying) returned 404 and Mayo Clinic blocks fetching, so they're not cited. The reel has no "see a doctor" line, and the caption says "Educational only, not medical advice."
- Re-encoded with the fixed enc_hq.sh: -1.9 dBTP.

## Episode badge
`python3 -I reels/brand.py earpop --ep 44` (renumbered by the main session) -> spot 651,260 (OVR ("R", 260)). Frames checked at 6, 25, 45, 60, 75 s: clear of labels, heads, seals and the end card.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (12-word first line, frame 0 subject moving, caption "That pop is a bubble of air.", "but" at 4.0 s)
- [x] 66-86 s (77.1 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Your move next flight: swallow, yawn, or gum?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 page dissolves in, max 50%, last 0.7 s)
- [x] pinned_earpop.md written
- [x] earpop_ep.mp4 made with brand.py (EP 44)
- [x] Timely window: Thanksgiving / holiday travel, late November to December

## Peer review
(pending; main session assigns a reviewer)
