# twinkle: NOTES (EP 94)

- **Template:** #29 particle flock (demo t29), on the coldbreath engine: formations that the flock morphs between with a per-particle stagger, karaoke caption box, a 40% frame-0 loop blend.
- **Why:** twinkling is a story about light as a stream of particles. The flock is the photons: one thin beam from a star point gets knocked around by moving air pockets, while a planet's disk sends many beams that average out.
- **Scenes (one per phrase):**
  - frame 0: a starry sky of twinkling particle stars; a big star jumps, dims and flashes colours; a banded planet glows "steady"; "TWINKLE, TWINKLE?";
  - IT'S THE AIR: the flock becomes a band of warm and cool air pockets;
  - STEADY FOR YEARS: a straight beam of photons through empty space;
  - THE LAST SPLIT SECOND: the atmosphere streak; the beam starts to wobble;
  - MOVING POCKETS (warm/cool blobs drifting);
  - EVERY POCKET BENDS LIGHT: the beam zig-zags, "bend!";
  - ONE THIN BEAM (a point);
  - JUMPS, DIMS, FLASHES!: the star jitters and flashes colours above the eye;
  - A TINY DISK: the flock fills the planet; LOTS OF POINTS (many beams); THEY AVERAGE OUT (beams wobble, the bundle stays put, STEADY);
  - LOOK LOW: dusk horizon with a twinkling low star; MORE AIR = MORE DANCE: a short overhead path vs a long slanted horizon path;
  - POINT vs DISK; SPOTTED ONE? YES / NO; the end card.
- **Layout:**
  - beam scenes use left-aligned titles with the beams at x 720-820 (inside x 900), so the light never crosses the type;
  - the eye and beam ends sit above the caption box (y 1010);
  - the caption box is bottom-anchored at y 1360 inside x 70-890.
- **Search question:** spoken at 0.35 s. Hook: 7 words. "But" at 3.0 s.
- **Re-hooks:** 18.9 s "Here's the trick"; 46.2 s "Look near the horizon".
- **Payoff:** 56.2 s. Question: "Have you spotted a planet tonight? Yes or no?"
- **Length:** 69.2 s. Voice af_heart 0.93; spec tail 0.6, so the end card is 2.9 s. Crayon bed; music_gain 0.6, fx_gain 0.35.
- **Encode:** enc_hq.sh with -aac_coder fast (from the handoff branch): -2.2 dBTP.
- **Badge:** EP 94 at (44, 1366), the free strip under the caption box (as coldbreath); the centred titles fill the top band. Checked every 3 s: always clear.
- **Ear check:** not done by a human yet.

## qa.py
```
QA twinkle: PASS   (/home/user/reel-render/jobs/twinkle/twinkle.mp4, 69.2 s)
  PASS  static          longest no-change run 3.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 5.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 19.2 dB above the pauses (5 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          69.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.5 (min 1.0), contrast 35.7 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      twinkle.mp4 1080x1920 SAR 1:1; twinkle_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 19% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do stars twinkle but planets don't"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (7 words = the search question; frame 0 is a flashing star vs a steady planet; "but" at 3.0 s)
- [x] 66-86 s (69.2); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (40% frame-0 blend)
- [x] Every claim sourced (sources_twinkle.md)
- [x] Pinned comment + thumbnail
