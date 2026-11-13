# fog: NOTES (EP 104)

- **Template:** #29 particle flock (Lemo demo t29), on the coldbreath engine (as twinkle, EP 94).
  - The flock is the fog: about 420 soft droplet particles re-form scene to scene.
  - Demo moves kept: gradient skies, the flock morphing between shapes, the glowing orb (the sun), handwritten notes with curved arrows, bold Inter titles.
  - Its own dawn-valley / grey / night-blue / sea palette, not twinkle's violet night.
- **Scenes (one per phrase):**
  - frame 0: a dawn valley; the fog bank spills over the low ground and into the lower third; a person walks half-hidden in it; a lamppost and the sun on the far hill; "WALKED THROUGH FOG?" "= a cloud";
  - "WHERE DOES FOG COME FROM?";
  - the flock forms a cloud that sinks to the ground beside a person;
  - vapor dots turn into bright droplets as a thermometer drops;
  - dense fog with lampposts fading out, "¼ MILE OR LESS";
  - two ways (1 / 2);
  - radiation fog: a clear starry night, heat squiggles leaving the ground; a layer grows from the ground up while HUMIDITY climbs to 100%; depth: 3 ft (a small person) vs about 1,000 ft (a tower);
  - the sun rises and the fog lifts and fades;
  - advection fog: peach moist-air dots blow left to right and turn into fog over cold water; a bank drifts in sideways ("chilled from below");
  - San Francisco: Golden Gate towers and cables in drifting fog, cold-water dots welling up, the label above the water;
  - payoff: both kinds side by side ("ground cools it" / "over something cold");
  - the question (YES / NO); the end card.
- **Main's notes (v2):**
  - claim hook first, then the search question, then the turn;
  - every scene drawn 130 px lower (ground at about y 1210) with fog spilling below the ground line, plus a slow low-mist band in y 1330-1710, so the lower third is never flat;
  - the SF label moved above the water.
- **Layout:** caption box bottom-anchored at y 1360 inside x 70-890; titles from y 460; nothing written right of x 900 below y 840; nothing written below y 1440.
- **Hook:** claim at 0.35 s; search question (5 words) at 3.3 s; "but" at 4.8 s.
- **Re-hooks:** about 20 s "So what cools the air that much? There are two main ways."; about 24 s radiation fog; about 44 s advection fog; about 55.6 s San Francisco.
- **Payoff:** about 63 s. Question: "Do you get fog where you live? Yes or no?"
- **Length:** 76.3 s. Voice af_heart 0.97; spec tail 0.6, so the end card is about 2.9 s. Crayon bed 88 bpm; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.5 s blends 40% of frame 0 (the engine's default; max 40%).
- **Sourcing:**
  - "usually burns off" (widespread fog can last);
  - visibility uses the NWS dense fog advisory threshold;
  - scijinks.gov was blocked in this session, so the same NOAA page is cited at nesdis.noaa.gov.
- **Badge:** EP 104 at (44, 1366), as twinkle. Checked every 3 s: clear under the caption box all the way through.
- **Ear check:** not done by a human yet.

## qa.py
```
QA fog: PASS   (/home/user/reel-render/jobs/fog/fog.mp4, 76.2 s)
  PASS  static          longest no-change run 0.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 13.6 dB above the pauses (7 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.7 (min 1.0), contrast 60.8 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      fog.mp4 1080x1920 SAR 1:1; fog_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("where does fog come from"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (claim at frame 0, then the 5-word search question; "but" at 4.8 s)
- [x] 66-86 s (76.3); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (40% frame-0 blend)
- [x] Every claim sourced (sources_fog.md); numbers in words in the spoken text
- [x] Pinned comment + thumbnail
