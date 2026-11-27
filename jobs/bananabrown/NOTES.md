# bananabrown: why do bananas turn brown? (Batch N, worker H4, EP 96)

- Template: **#13 collage "AI Doom"** (styles/aidoom/aidoom.js; reserved by the main session; last used for eyeblink EP 76). Main session ask: a fresh palette and cast so it doesn't read like eyeblink/sneeze. Palette: leaf green, teal, butter and terracotta sets (no purple/beige); cast: cut-paper banana characters (green / yellow / spotted / chilled), the PPO enzyme blob with scissor arms, the oxygen twins, a frosty fridge. The kid and the box creature are not used.
- Length 76.7 s (spec tail 0.7, end card about 3 s); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_bananabrown.js, t_bananabrown.html, specs/bananabrown.json, tl_bananabrown.js, ev_bananabrown.json.
- Kept from the demo: little paper sets (wall + floor + baseboard + perspective floor), museum frames and velvet rope, plaques, chalkboards, ransom-note letters, stamps, watercolour mottle and paper grain, hard cuts with a short whip blur, karaoke caption on a dark plate, cork end card.
- Hook (main session wording): "Brown banana spots are made of melanin, the same kind of pigment as a suntan." (both make melanin pigments, by different routes).
- Beats: frame 0 a banana in sunglasses under a paper sun, spots popping on, "SUNTAN?" -> ethylene puffs (C2H4 sketch) ripen green bananas -> "15 parts per BILLION" chalkboard dot field -> enzyme and dopamine jars kept apart -> "SAME MOLECULE": banana and brain in museum frames + the dopamine structure -> the jars crack, the enzyme grabs the oxygen twins, a conveyor turns dopamine brown -> a bonk and a fast bruise ("BRUISE = FASTER") -> the fridge below 13 °C (55 °F), the banana shivering and darkening -> cut open: dark peel, fresh inside -> "THE TRICK": counter, then fridge -> summary chalkboard -> "BROWN SPOTS?" YES/NO.
- Batch N layout: captions on a dark plate at y 1160-1420; titles below y 345 (badge strip); no text in the right column below y 840 (the 13 °C label and the "inside: fresh" plaque were moved in).
- Re-hooks: 27.5 s "Here's the weird part: ... dopamine, the same molecule your brain uses", 46.6 s "But here's the catch: the fridge".
- Demand signal: "why do bananas turn brown" / "should you refrigerate bananas" are evergreen searches.

## Softened / not used
See sources_bananabrown.md.

## QA (python3 -I reels/qa.py bananabrown, handoff qa.py)
```
QA bananabrown: WARN   (/home/user/reel-render/jobs/bananabrown/bananabrown.mp4, 76.8 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 27.5-34.2s, 48.8-53.0s, 63.5-70.0s
  WARN  outer 24 px     content at the frame edge 27.5-31.2s, 55.2-58.2s, 73.8-76.2s
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.0 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.5 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.7 (min 1.0), contrast 33.3 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      bananabrown.mp4 1080x1920 SAR 1:1; bananabrown_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
The WARNs are art only (a small banana, the rope post, the fridge thermometer bulb, the summary banana and floor lines in the right strip; the end card's cork border at the frame edge).
Fix history: the first banana shape read as an upside-down crescent (redrawn as a thick, tapered smile-shaped banana with a stem and dark tip); the hook moved down off the title; two labels moved out of the right strip; titles moved below the badge.

## Episode badge
`python3 -I reels/brand.py bananabrown --ep 96` with OVR spot ("R", 260) and the ransom end card hidden (73.4 s on). Frames checked at 6, 10, 15, 21, 27, 35, 42, 47, 54, 59, 64, 70, 73 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (14-word first line, 2 more than the 12-word guideline, main-session wording, frame 0 subject moving (spots popping), "but" at 5.6 s)
- [x] 66-86 s (76.7 s); ends on the exact closing line; end card about 3 s
- [x] One-word-answer question before the closing line ("Do you eat bananas with brown spots? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (dissolves back to the sunglasses banana)
- [x] pinned_bananabrown.md written
- [x] bananabrown_ep.mp4 made with brand.py (EP 96)
- [x] Evergreen

## Peer review
(pending; main session assigns a reviewer)
