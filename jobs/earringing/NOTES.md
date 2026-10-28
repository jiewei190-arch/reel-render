# earringing: NOTES (EP 90)

- **Template:** #7 silkscreen-poster on H1's contrails engine (print table, squeegee pulls, split-fountain bead, screen lift, stepped bands, info band, cloud-band wipes, wall lockup, end card in two pulls).
- **Look:** a concert gig poster in night inks (pink, purple, indigo, amber, mint on a dark plum table), so it reads apart from contrails' blue skies (main's note).
- **Sections:**
  - banner hook: frame 0 rides a big printed music note across the pink and purple sky with white sound-wave arcs behind it, then pulls back to "WHY DO YOUR EARS RING?";
  - but-turn card: a split-fountain pull of swaying hair cells, "NOT STUCK SOUND. TIRED HAIR CELLS.";
  - poster 01 HAIR CELLS: a cochlea spiral; the hair cells sway and send signal dots up;
  - poster 02 94–110 dB: speaker stacks pulse, a dB dial needle climbs, crowd silhouettes, and ×1/×10/×100 bars for "+10 dB = 10× intensity";
  - poster 03 EEEEEEEE: an ear, the hair cells bent flat, red ringing waves, a 1–2 DAYS clock;
  - poster 04 DON'T GROW BACK: a bird and a frog with regrow arrows, the human ear with a red X, an 85 dB dashed line;
  - wall lockup (payoff), an EARPLUGS + STAND BACK strip pulled for the close and the question;
  - the end card printed in two pulls with the note and its waves.
- **Layout:**
  - posters framed in y 250-1150; the printed caption strip at y 1170-1410 (text inside x 190-890);
  - nothing written in the top 250 px or the right column.
- **Search question:** spoken at 0.35 s. Hook: 8 words. "But" at 2.8 s.
- **Re-hooks:** 21.9 s "Here's the catch"; 40.6 s "Now the scary part".
- **Payoff:** 55.5 s. Close: earplugs + stand back. Question: "Earplugs at concerts: yes or no?"
- **Length:** 70.0 s. Voice af_heart 0.92; spec tail 0.6, so the end card is 2.9 s. Popup bed 96 bpm; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.5 s blends at most 30% of frame 0 (the engine's loop).
- **Badge:** EP 90 at (44, 260) as contrails (same engine). Visible over the banner hook, the wall and the end card; hidden 6.5-57.4 s while the posters fill the frame (their HOW IT REALLY WORKS header sits at y ~270).
  - Frames checked across the visible spans. Over the earplug strip (62-66 s) the badge sits about 6 px above the strip edge, clear of its lettering.
- **v2 (main's note):** the white sound-wave arcs crossed "EARS RING?" when the camera pulled back to the banner (about 2.5-6 s) and on the wall. Once the title is printed, the arcs are now drawn only right of the lettering (banner x > 1420). The frame-0 hook keeps all its arcs.
- **Ear check:** not done by a human yet.

## qa.py
```
QA earringing: PASS   (/home/user/reel-render/jobs/earringing/earringing.mp4, 70.0 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.8 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 17.7 dB above the pauses (7 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          70.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.2 (min 1.0), contrast 72.3 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      earringing.mp4 1080x1920 SAR 1:1; earringing_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do my ears ring after a concert"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (8 words = the search question; frame 0 is a big moving note + sound waves; "but" at 2.8 s)
- [x] 66-86 s (70.0); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] Every claim sourced (sources_earringing.md); numbers in words in the spoken text
- [x] Practical close: earplugs + stand back
- [x] Pinned comment + thumbnail
