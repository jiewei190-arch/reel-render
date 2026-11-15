# knuckles: why does cracking your knuckles make a pop? (Batch N, worker H4, EP 67)

- Template: **#11 cel-boil** (the demo via reels/kit_celboil.js, as in match). Why: the topic is one short, punchy event (the pop), which is cel-boil's engine (STYLE_FIT: "chemistry with action: ignite, snap, pop"): drawings on ones for the pop and the snap, a fresh boil per drawing, camera shakes, off-register colour, paper tooth. Previous H4 reels: firstsnowsmell (#7), daylightsleep (#6).
- Length 77.2 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_knuckles.js, t_knuckles.html, specs/knuckles.json, tl_knuckles.js, ev_knuckles.json.
- Copied from the demo: boiled ink lines and cel fills with registration offset, Caveat boiled titles, exposure sheet (ones for the pops, twos for explanations, threes for cards), push-ins and shakes on the strike moments, cartoon props with faces, star bursts, speed lines, hatch shading, the boiled caption box.
- Batch N layout: drawings and titles in y 380-1110 (titles kept below y 390 so the EP badge has the top-right strip); the boiled caption box at y 1150, x 60-900; nothing in the bottom 480 px.
- Hook: frame 0 is the hand already pulling its finger, motion lines, a joint inset; the bubble pops into being at 1.4 s with a shake and a POP star; title "A BUBBLE IS BORN".
- Re-hooks: 18.8 s "In 2015, researchers filmed it inside an MRI scanner", 46.1 s "half an hour to reset" then 53.2 s the one-hand experiment. Payoff: 14.5-26 s (a cavity snaps open, seen on MRI) and the honest debate 29.7-45.4 s (forming vs partial collapse, not settled).
- Loop ending: the end card repeats the hook's hand and POP burst.
- Demand signal: "why do knuckles crack" / "is cracking your knuckles bad" are evergreen People-Also-Ask questions.
- Open question: what makes the pop? Answered at 14.5-26 s and 42.1-45.4 s (not settled).

## Softened / not used
See sources_knuckles.md (debate presented, not decided; Unger is n = 1; no medical advice).

## QA (python3 -I reels/qa.py knuckles)
```
QA knuckles: PASS   (/home/user/reel-render/jobs/knuckles/knuckles.mp4, 77.2 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.3 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 12.9 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          77.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 13.2 (min 1.0), contrast 30.8 (min 18.0)
  PASS  9:16 frame      knuckles.mp4 1080x1920 SAR 1:1; knuckles_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history: the first render passed QA but the auto badge (top-right) touched the titles "gas comes out", "MRI", "COLLAPSING?" and "300 people"; titles moved below y 390 and re-rendered.

## Episode badge
`python3 -I reels/brand.py knuckles --ep 67` -> spot 651,260 (auto, no OVR). Frames checked at 6, 9, 13, 16, 23, 28, 33, 39, 44, 49, 55, 60, 67, 74 s: clear of titles and captions (only bone art passes under it).

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (11-word first line, frame 0 subject moving, title "A BUBBLE IS BORN", "but" at 4.3 s)
- [x] 66-86 s (77.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Are you a knuckle cracker? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (end card repeats the hook's hand + POP)
- [x] pinned_knuckles.md written
- [x] knuckles_ep.mp4 made with brand.py (EP 67)
- [ ] Timely window: evergreen

## Peer review
(pending; main session assigns a reviewer)
