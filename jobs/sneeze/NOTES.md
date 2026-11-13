# sneeze: why do we sneeze? (Batch N, worker H3)

- Template: **#13 collage "AI Doom"** (demo 78, x.com/doubleunplussed; built on the existing reels/styles/aidoom/aidoom.js kit). Why: a reflex is a chain of little events, and the demo explains ideas as a run of small paper-cutout sets (the kid, the box creature, plaques, chalkboards, a lab panel, a theatre curtain, ransom-note letters). Not used in the last ~8 EPs.
- Taken from the demo / kit: flat paper sets (wall + floor + baseboard) with warm grain and watercolour mottle; the spiky-haired kid and the orange box creature; the museum plaque and velvet rope; chalkboards with chalk handwriting; the lab panel style; the theatre curtain; ransom-note cut-out letters (AH... / ACHOO! / WHY DO WE SNEEZE? / 1 IN 4 / PHOTIC SNEEZE / MYTH? / BUSTED / SUN-SNEEZER?); karaoke words that light up as spoken; hard cuts with a short whip blur.
- Length 73.2 s (one line cut so the payoff lands at 62.2 s); af_heart 0.97; music popup 96 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_sneeze.js, t_sneeze.html, specs/sneeze.json, ev_sneeze.json, tl_sneeze.js.
- Batch N layout: ransom titles at y >= 278; caption on a dark band at y 1158-1354, left-aligned x 90-880, shrinking to 42 px if it would need 4 lines; badge strip y 1366-1440 on the floor; nothing written in the bottom 480 px or the right column below y 840.
- Loop ending: in the last 0.5 s, the frame-0 garden (kid + pollen + "AH...") dissolves in at most 40%.
- Demand signal: "why do we sneeze" / "why do I sneeze in the sun" / "does your heart stop when you sneeze" are evergreen body searches.
- Structure: hook (the sneeze itself) → reflex (plaque) → irritants into a giant paper nose → chalk trigeminal nerve → signal to the brainstem ("sneeze centre?", spoken as "scientists think") → eyes shut, deep breath (re-hook 24.7 s) → pressure gauge → ACHOO → irritants washed out → wow: 1 in 4 sneeze in bright light (25.6% in a 2019 study), the photic sneeze reflex, "nobody knows exactly why; one idea" → re-hook 50.4 s: the heart-stop myth on a theatre stage → chest pressure + heart ("the rhythm shifts, briefly") → ECG keeps going, BUSTED → payoff 62.2 s: "your nose's emergency exit" (EXIT sign) → "Sun-sneezer?" → end card.

## Approval notes applied
- "about 1 in 4" kept with Wang 2019 (25.6%) on screen; the sneeze centre is "scientists think" (unconfirmed in humans).
- Standing checks: big moving frame 0 (kid at 1.55x sneezing at 1.1 s); no near-identical shot over 6 s (the two heart scenes are now a gauge + heart shot and the ECG shot); blank frames PASS.

## Softened / not used
- No sneeze-speed number; the photic mechanism is "one idea"; the Library of Congress pages could not be fetched (HTTP 403) and are not cited.

## QA (python3 -I reels/qa.py sneeze)
```
QA sneeze: WARN   (/home/user/reel-render/jobs/sneeze/sneeze.mp4, 73.2 s)
  PASS  static          longest no-change run 1.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 9.0-13.8s, 24.8-27.2s, 27.5-30.8s, 41.2-43.5s ...
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.0 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.9 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          73.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 8.6 (min 1.0), contrast 45.3 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      sneeze.mp4 1080x1920 SAR 1:1; sneeze_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- WARN outer 24 px: art only (the giant paper face profile touches the left edge, the panel/curtain sets run to the edges); no text there.
- Badge: sneeze_ep.mp4 EP 71 at (44, 1366); frames at 6/25/45/56/60/72.8 s checked, clear of all text.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (7-word first line; frame 0 the kid mid-"AH..." with pollen; "But" at 2.4 s; search question spoken at 2.4-4.9 s)
- [x] Re-hooks at 24.7 s and 50.4 s; payoff 62.2 s
- [x] 66-86 s (73.2 s); ends on the exact closing line
- [x] One-word question before the closing line ("Sun-sneezer?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 garden dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_sneeze.md written
- [x] sneeze_ep.mp4 (EP 71, spot (44, 1366))
- [x] Sources: primary journal papers + a university medical centre (sources_sneeze.md)
