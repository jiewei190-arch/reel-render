# firstsnowsmell: can you really smell snow coming? (Batch N, worker H4, EP 52)

- Template: **#7 silkscreen-poster** (the demo's real engine: reels/styles/silkscreen-poster/engine, as in skyblue). Why: the honest answer is three clues of different strength, which is the template's three-poster series + wall lockup: COLD, DAMP, NERVE posters printed one ink per beat, then the lockup lights each clue for the payoff. Previous H4 reel (daylightsleep) was #6, so no repeat.
- Length 76.9 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_firstsnowsmell.js, t_firstsnowsmell.html, specs/firstsnowsmell.json, tl_firstsnowsmell.js, ev_firstsnowsmell.json.
- Copied from the demo: print table with planks, stains and tape; posters registered with tape; squeegee pulls with ink bead (one ink, one beat); stepped bands instead of gradients; halftone; paper as a colour; slab headlines; info band with name and number; tree-silhouette transitions; the visitor-centre wall lockup with banner; the end card printed in two pulls.
- Batch N layout: posters framed at 0.68 with their top at y 340 (art ends above y 1150); the printed caption strip moved to y 1150-1420 and x 40-900; the wall lockup kept to x 40-900; end card text band y 820-1420; EP badge in the table strip at (44, 260) (OVR).
- Hook: frame 0 is the intro poster on the table with the squeegee mid-pull laying down the snowflakes; slab head "SMELL SNOW?" prints at 0.75 s; line 1 is the exact search question.
- Re-hooks: 24.8 s "In one lab study..." then "barely changed... shaky" (honest twist); 51.6 s "Monell researchers found..." (mucosal cooling). Payoff 58.8-66.5 s on the wall ("PARTLY A FEELING" stamp).
- Loop ending: the last tree-silhouette wipe brings back the frame-0 intro poster.
- Demand signal: "can you smell snow" / "why can I smell snow coming" are seasonal People-Also-Ask questions; timely at first snow (Nov-Dec).
- Open question: what are you noticing when you "smell snow"? Answered explicitly at 58.8-66.5 s.

## Softened / not used
See sources_firstsnowsmell.md (no ozone/geosmin; humidity clue called shaky; "partly", not "no").

## QA (python3 -I reels/qa.py firstsnowsmell)
```
QA firstsnowsmell: PASS   (/home/user/reel-render/jobs/firstsnowsmell/firstsnowsmell.mp4, 76.8 s)
  PASS  static          longest no-change run 2.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.0 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.0 (min 1.0), contrast 56.5 (min 18.0)
  PASS  9:16 frame      firstsnowsmell.mp4 1080x1920 SAR 1:1; firstsnowsmell_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history: slab heads SMELL SNOW?, COLD and DAMP were printed in the light ink and vanished into the pale art: reprinted in the dark 'near' ink; posters reframed from 0.72 (top y 255) to 0.68 (top y 340) so the EP badge has a clear strip; the thumbnail no longer carries a subtitle.

## Episode badge
`python3 -I reels/brand.py firstsnowsmell --ep 52` with OVR spot (44, 260) in the table strip above the posters (auto spot 651,400 sat on poster art and the wall banner). Frames checked at 0.5, 6, 15, 28, 40, 52, 61, 66, 70, 75 s: clear.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (8-word first line = the search question, frame 0 subject moving (squeegee pulling the snow poster), slab "SMELL SNOW?" at 0.75 s, "but" at 3.3 s)
- [x] 66-86 s (76.9 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Can you smell it coming? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (the last tree wipe brings back the frame-0 intro poster)
- [x] pinned_firstsnowsmell.md written
- [x] firstsnowsmell_ep.mp4 made with brand.py (EP 52)
- [x] Timely window: first snow, November to December

## Peer review
(pending; main session assigns a reviewer)
