# planelift: how do planes actually stay in the air? (Batch N, worker H4, EP 68)

- Template: **#9 scifi-toon** (toon.js + cast_af.js, as in slipperyice). Re-staged from #3 blueprint at the main session's request (ovenfoil EP 60 and fridge EP 66 were already blueprint). Why: a myth-bust told as an episode of a lab cartoon. Juno and Spud test the textbook story in a toon wind tunnel, numbered U-tags carry the units (U-1 textbook, U-2 wind tunnel, U-3 sail, U-4 turning, U-5 pressure), and the lab verdict board closes it (INCORRECT, then BOTH TRUE).
- Length 69.5 s; af_heart; music at music_gain 0.7; fx from ev_planelift.json (rebuilt for the new cuts).
- Code: reels/t_planelift.js, t_planelift.html, lip_planelift.js, specs/planelift.json, tl_planelift.js, ev_planelift.json. The blueprint version is kept as reels/t_planelift_blueprint.js/.html.
- Layout: subtitles on dark plates centred at x 500, y 1150-1420; U-tags top-left at y ~255-340; badge 560,260; the lab clock moved right (1050,330) and the end-card title moved down (y 470) so both clear the badge. Hook card and BOTH TRUE card were lifted off the subtitle plate (y 700 / 960).
- Hook (main session): "The textbook reason planes fly is wrong." Frame 0: the wing in the wind tunnel under the orbiting WHY PLANES / STAY UP title, with a red TEXTBOOK "longer path!" card that a red X stamps out at 1.5 s. Line 2 carries the search question and the myth; "but" at 3.2 s.
- Re-hooks: ~21 s smoke pulses (red over the top beats blue underneath; "TOP: FIRST!"), ~30 s "So what really holds up a jet?", ~48 s "Here's the catch" (BOTH TRUE on the verdict board). Payoff 30-62 s.
- Loop ending: the end card is the same title ring and wing that open the reel.
- Demand signal: "how do planes stay in the air" / "how do wings create lift" are evergreen People-Also-Ask questions; holiday travel season.

## Softened / not used
See sources_planelift.md (no numbers; streamlines, smoke pulses and downwash schematic; "much of the lifting" qualitative).

## QA (python3 -I reels/qa.py planelift)
```
QA planelift: WARN   (/home/user/reel-render/jobs/planelift/planelift.mp4, 69.5 s)
  PASS  static          longest no-change run 2.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  WARN  safe zones      right x>900 y900-1650: content 0.0-8.2s, 8.8-20.0s, 20.5-25.2s, 33.0-41.5s ...
  WARN  outer 24 px     content at the frame edge 0.0-3.0s, 12.8-20.0s
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.9 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          69.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 11.0 (min 1.0), contrast 82.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      planelift.mp4 1080x1920 SAR 1:1; planelift_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
The two WARNs are set art (tunnel window, wing, sail, flow lines) reaching the right strip and the frame edge; no text sits there. Same pattern as slipperyice (#9).
Fix history: the TEXTBOOK card and BOTH TRUE card first sat under the subtitle plate (moved up); white smoke pulses were invisible on the pale tunnel glass (now red over / blue under, 8 streams); the auto badge spot touched the lab clock (spot 560,260 plus the clock moved).

## Episode badge
`python3 -I reels/brand.py planelift --ep 68` with OVR spot (560, 260). Frames checked at 1, 10, 16, 22, 27, 35, 45, 51, 58, 67 s: clear of the U-tags, the lab clock, the title ring and the end card.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (7-word first line, frame 0 subject moving, the TEXTBOOK card gets stamped, "but" at 3.2 s)
- [x] 66-86 s (69.5 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you learn the longer-path myth at school? Yes or no?", with YES?/NO? cards)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (end card over the opening title ring and wing)
- [x] pinned_planelift.md written
- [x] planelift_ep.mp4 made with brand.py (EP 68)
- [x] Timely window: holiday travel (late Nov - Dec), otherwise evergreen

## Peer review
(pending; main session assigns a reviewer)
