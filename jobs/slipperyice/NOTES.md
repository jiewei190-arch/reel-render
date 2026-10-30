# slipperyice: why is ice slippery? (Batch N, worker H4, EP 46)

- Template: **#9 scifi-toon** (lemo-opuscar styles/scifi-toon; module reels/styles/scifitoon, cast from airfryer). Why: a myth-bust with competing explanations becomes a suspect line-up on the lab blackboard, and each suspect is one of the template's colour-coded worlds reached through the portal (U-1 pressure world 1886 in brass/sepia, U-2 friction world in orange/teal, U-3 the molecular surface in ultraviolet/ice blue). STYLE_FIT: scifi-toon = myth-busting everyday things. My previous reel (earpop) was #18, so no repeat.
- Length 72.0 s; af_heart 0.97; music crayon 88 bpm; fx_gain 0.5. Lip sync from the voice envelope (reels/lip_slipperyice.js).
- Code: reels/t_slipperyice.js, t_slipperyice.html, specs/slipperyice.json, tl_slipperyice.js, ev_slipperyice.json, lip_slipperyice.js.
- Copied from the demo: Bungee title lockup with cream letters, magenta offset and cyan orbit ring (an ice cube orbits), 12 fps character boil and mouth steps with on-ones camera, portal swirl wipes (no dissolves), the portal as the only glow, typed VT323 world tags, Baloo ExtraBold subtitles with the JUNO speaker pill, VT323 readouts, pop-in signs and stamps, Juno and Spud (Spud now on skates).
- Batch N layout: world tags moved to y 262; subtitles at y about 1130-1400; the molecule slab is clipped at x 870 and ends at y 1640 (it first filled the right button column and failed qa.py); press readouts beside the press arm; end-card handle at y 1360.
- Hook: frame 0 is Spud big, mid-glide across the rink, ice spray, title lockup "WHY IS ICE SLIPPERY?" (the search question) from frame 0; the "KG → MELT? (the old answer)" panel pops at 0.9 s and is X-stamped at 1.9 s.
- Re-hooks: 22.6 s "Suspect two" (friction world, speed and blade-temperature meters), 49.1 s "slipperiest around minus seven degrees" (the chart). Payoff 58-65 s on the verdict board.
- Loop ending: the last 0.35 s portal-swirls (the template's own transition) back toward the rink of frame 0; no fade to black.
- Demand signal: "why is ice slippery" is a standard People-Also-Ask question and a classic myth (pressure melting is still in textbooks, per Physics Today); seasonal: first ice and skating season (Dec-Feb).
- Open question: if not pressure, what makes ice slippery? Answered explicitly at 58-65 s.

## Softened / not used
See sources_slipperyice.md ("mostly not pressure", "suggests" for the 2025 simulation, the chart is schematic, 466 atm on screen only).

## v2 (main-session storyboard notes, Oct 28)
- On-screen years are digits (tag "year: 1886", readout "2018", subtitles "1886", "1850s", "2018", "2025"); the spoken field keeps them in words.
- Every subtitle sits on the template's dark plate (ink, 86%), so it reads over white ice and the molecule wall.
- Hook: Spud is mid-glide at t=0 and the carved skate trail grows behind him from frame 0 (Spud is the skater in this reel; Juno hosts in the lab).
- Re-encoded with the fixed enc_hq.sh (limit 0.7, no latency): -1.7 dBTP; no separate re-mux needed any more.

## Audio note (v1)
enc_hq.sh's `alimiter ... latency=true` produced a single +3.6 dBTP click at 31.8 s in the AAC (the source mix peaks at -1.3 dB). Final audio re-muxed from out/slipperyice.mp4 with `alimiter=limit=0.79:level=false` at AAC 96k: -1.5 dBTP. The shared script is unchanged (reported to the main session).

## QA (python3 -I reels/qa.py slipperyice), v2
```
QA slipperyice: WARN   (/home/user/reel-render/jobs/slipperyice/slipperyice.mp4, 72.0 s)
  PASS  static          longest no-change run 1.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  WARN  safe zones      right x>900 y900-1650: content 3.8-7.2s, 7.8-17.8s, 58.2-67.8s
  WARN  outer 24 px     content at the frame edge 7.5-17.8s, 33.0-49.0s
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.7 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.1 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 13.8 (min 1.0), contrast 50.4 (min 18.0)
  PASS  9:16 frame      slipperyice.mp4 1080x1920 SAR 1:1; slipperyice_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
The WARNs are character art (Juno at the right edge in the lab and press shots, the clipped molecule slab), not text.

## Episode badge
`python3 -I reels/brand.py slipperyice --ep 46` with a new OVR line: spot ("R", 260), hidden from 67.6 s (the end-card title). The auto spot (651,540) hit the blackboard, plaques and signs. Frames checked at 6, 15, 25, 40, 45, 52, 56, 63, 67, 70 s: clear.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (10-word first line, frame 0 subject moving, caption "WHY IS ICE SLIPPERY?", "but" at 3.8 s)
- [x] 66-86 s (72.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Your bet: suspect one, two, or three?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (portal swirl back to the rink)
- [x] pinned_slipperyice.md written
- [x] slipperyice_ep.mp4 made with brand.py (EP 46)
- [x] Timely window: skating season, December to February

## Peer review
(pending; main session assigns a reviewer)
