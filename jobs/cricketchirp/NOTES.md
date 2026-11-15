# cricketchirp: can you tell the temperature from cricket chirps? (Batch N, worker H4, EP 81)

- Template: **#1 paper-lantern** (Paper-cut Lightbox; styles/lantern/lantern.js, the gps/foxfire grammar; reserved by the main session; last lantern was gps EP 69). Why: a night-meadow topic is the lantern's lit shadow-box language, and the chirps become its emissive light.
- Length 74.4 s (spec tail 0.7, end card about 3 s); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_cricketchirp.js, t_cricketchirp.html, specs/cricketchirp.json, tl_cricketchirp.js, ev_cricketchirp.json.
- Copied from the demo/gps: one lit shadow box per shot inside the wooden lamp frame, baked cut-paper layers (far hills light -> front grass dark, backlight + pulp mottle, cast shadows, a blurred front layer), emissive light (glowing sound arcs on every chirp, the oil lamp, the moon, the green spotlight on the snowy tree cricket), paper strips that grow from an edge with red seals, Caveat handwritten tags, the vertical title strip (CRICKET, °F seal), dissolves between shots, YES/NO and end-card tags lying on the table under the lamp.
- Batch N layout (as gps): the lamp window is y 270-1130; in-box strips start at box y 130 (screen y >= 360) so the top-left badge is clear; captions on the dark room at y 1180-1400; below that only the table and the lamp's spill light.
- Hook: frame 0 is the meadow at night, a cut-paper cricket on the grass chirping glowing arcs, a paper thermometer hanging like a lantern, the strip "a living thermometer", vertical CRICKET strip; "but" at 3.5 s.
- Beats: the question close-up -> Dolbear 1897 at his desk by an oil lamp (strip "The Cricket as a Thermometer") -> 60 °F / 70 °F cards filling with 80 and 120 chirp dots -> a stopwatch sweeping 15 s while chirp tallies appear, "30 chirps + 40 = 70 °F" -> "not measuring anything / cold-blooded" -> the box splits cool night slow vs warm night fast -> wings rubbing close-up -> a line-up with a red ONE seal -> the snowy tree cricket glowing green ("the thermometer cricket") -> three crickets, three rhythms -> frost, slow arcs -> payoff with stopwatch, tally and the formula strip -> question.
- Re-hooks: 26.5 s "Here's the weird part: the cricket isn't measuring anything", 43.6 s "But here's the catch: it works best for one kind of cricket".
- Main session asks: NOAA's 15 s + 40 with Dolbear's own numbers on screen; the hook claim kept honest in the caption ("Roughly, yes, for the right cricket"; the voice says "Pretty much, yes"); end card about 3 s.
- Demand signal: "how to tell temperature by cricket chirps" / "Dolbear's law" are evergreen searches; late-summer and autumn nights.

## Softened / not used
See sources_cricketchirp.md (15 s, not 14 s; "most people think" for the species; no accuracy figure).

## QA (python3 -I reels/qa.py cricketchirp, handoff qa.py)
```
QA cricketchirp: PASS   (/home/user/reel-render/jobs/cricketchirp/cricketchirp.mp4, 74.2 s)
  PASS  static          longest no-change run 3.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.8 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.5 (min 1.0), contrast 36.6 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      cricketchirp.mp4 1080x1920 SAR 1:1; cricketchirp_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history: the first cricket sprite read like a spider (redrawn with a drumstick hind femur, cerci, a real head and eye); Dolbear's paper sat across his face (the desk now in front, the paper on it); the auto badge spot touched the in-box strips (strips moved 40 px down, OVR spot (44, 260)).

## Episode badge
`python3 -I reels/brand.py cricketchirp --ep 81` with OVR spot (44, 260). Frames checked at 6, 10, 16, 22, 28, 34, 40, 45, 50, 56, 59.5, 64, 69, 72 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (7-word first line, frame 0 subject moving (chirp arcs), "but" at 3.5 s)
- [x] 66-86 s (74.4 s); ends on the exact closing line; end card about 3 s
- [x] One-word-answer question before the closing line ("Have you ever counted cricket chirps? Yes or no?", YES/NO tags)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (the end card returns to the hook's meadow, cricket and thermometer)
- [x] pinned_cricketchirp.md written
- [x] cricketchirp_ep.mp4 made with brand.py (EP 81)
- [x] Evergreen (best late summer / autumn)

## Peer review
(pending; main session assigns a reviewer)
