# eyeblink: why do we blink so much? (Batch N, worker H4, EP 73)

- Template: **#13 collage "AI Doom"** (styles/aidoom/aidoom.js, cast, sets and caption band as in yawn, EP 34). Why: a brain/attention topic told through paper-set metaphors, which is AI Doom's strength (STYLE_FIT: "psychology, concepts best told through metaphor"): a museum EXHIBIT of the eye with the lid as a tear wiper, a theatre audience blinking in sync, a film strip with closed-eye marks on the calm frames, a brain scanner, ATTENTION meter vs DEFAULT MODE lamp, the box creature on a deck chair inside the brain (micro-break), a FAKE BLINK with a NO SHIFT stamp, two doors for two jobs. Not used in the last ~8 EPs (main session list).
- Length 81.0 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_eyeblink.js, t_eyeblink.html, specs/eyeblink.json, tl_eyeblink.js, ev_eyeblink.json.
- Copied from the demo/yawn: paper sets (wall + floor + baseboard + perspective floor lines), the spiky-haired kid and the orange box creature (both blink on their own rhythm; mood "closed"/"sleepy"), museum frame + velvet rope, serif plaques with citations, chalkboards, ransom-note letters, watercolour mottle and paper grain, hard cuts with a short whip blur, karaoke caption on a dark plate.
- Batch N layout: captions on a dark plate centred at y 1290 (y 1160-1420; phrases over 3 lines drop to 42 px); all scene titles and plaques start below y 345 so the EP badge has the top-right strip; nothing in the bottom 480 px.
- Hook: frame 0 is the kid in close-up mid-blink; on each of his blinks the whole set dims for a beat ("you go blind for a moment"); ransom "BLINK 15x A MINUTE" and a "blinks: n" counter. "but" at 4.0 s.
- Re-hooks: 23.9 s "Here's the weird part: ... blinked together" (theatre audience in sync), 50.6 s "So here's a wild idea: ... micro-break", 57.1 s "Here's the catch: a fake blink didn't do it" (NO SHIFT). Payoff 43.7-72.8 s.
- Findings framed as findings: "seem to", "may", "one idea", "studies suggest", "still testing it" (main session ask).
- Loop ending: the last 0.6 s dissolves back into frame 0.
- Demand signal: "why do we blink" / "how many times do we blink a minute" are evergreen People-Also-Ask questions.

## Softened / not used
See sources_eyeblink.md (AAO's "about 15" instead of 15-20; no blink-duration figures; "lit up" = increased activity).

## QA (python3 -I reels/qa.py eyeblink, handoff qa.py with the blank-frames check)
```
QA eyeblink: WARN   (/home/user/reel-render/jobs/eyeblink/eyeblink.mp4, 81.0 s)
  PASS  static          longest no-change run 1.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 8.2-13.8s, 14.0-19.8s, 53.5-57.0s, 63.5-73.2s
  WARN  outer 24 px     content at the frame edge 8.2-13.8s, 41.2-43.5s, 71.0-73.2s
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.7 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.2 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          81.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.9 (min 1.0), contrast 32.0 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      eyeblink.mp4 1080x1920 SAR 1:1; eyeblink_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
The WARNs are art only: the perspective floor lines, the chalkboard frame, the BRAIN BREAKS door and the box creature reach the right strip; no text sits there (the "eyes cope" plaque was moved in to x 500-860).
Fix history: 5-line captions overflowed the band (now 42 px when over 3 lines); the question plaque covered the kid's head; "in sync!" and the film-strip labels sat under the audience; YES/NO plaques were behind the kid; the auto badge spot (651,330) sat on titles, so every title/plaque moved below y 345.

## Episode badge
`python3 -I reels/brand.py eyeblink --ep 73` with OVR spot ("R", 260) and the ransom end card hidden (76.9 s on). Frames checked at 1, 6, 10, 16, 18, 21, 26, 32, 38, 42, 46, 52, 55, 59, 66, 70, 74 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (11-word first line, frame 0 subject moving, the set dims on each blink, "but" at 4.0 s)
- [x] 66-86 s (81.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you just blink at the end of a sentence? Yes or no?", YES/NO plaques)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending
- [x] pinned_eyeblink.md written
- [x] eyeblink_ep.mp4 made with brand.py (EP 73)
- [x] Evergreen

## Peer review
(pending; main session assigns a reviewer)
