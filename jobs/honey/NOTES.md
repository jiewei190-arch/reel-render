# honey: NOTES (EP 103)

- **Template:** #23 recipe card (Lemo recipe-card grammar, demo t23), on the in-house recipe kit (as handwarmer, EP 36).
  - The demo's grammar carries the explanation: a "Honey" recipe card with a ticked checklist; a step header with a big handwritten counter; a % scale with a rust pointer; a segmented progress bar (SIP / PASS / ENZYME / DRY / FAN / CAP); thin pencil doodles with pale fills; the "Good drink." sign-off as "Good honey." with ink splats.
- **Pages:**
  - frame 0 (main's note): the water counter is already running 60% → 18% with a pointer on a scale beside a full honey jar; a bee sips a pink flower; title "Nectar → honey?";
  - "two changes" (rust arrow, circled 1 and 2);
  - sip into the honey crop (the crop fills amber inside the bee);
  - pass it on, mouth to mouth (a droplet between two bees);
  - invertase cuts sucrose into glucose + fructose (two hexagon rings split by rust scissors);
  - too watery: a jar of nectar bubbles, "ferment!";
  - dry on the way: "×2 sugar" in the crop vs the flower;
  - tongue drying (droplet out, in, out, in);
  - fan the wings over the comb (air lines);
  - down to about 18% water (counter + scale);
  - seal with wax (caps close cell by cell);
  - "Good honey."; the question; the end card.
- **Layout:**
  - card x 560-1020, y 360-840; header left; doodles y 860-1130;
  - captions centred at y 1250 (max 3 lines, box bottom about 1357, above the badge);
  - nothing written right of x 900 below y 840; nothing below y 1440 except the badge.
- **Motion:**
  - v1 failed QA static (19.5-24 s, 24.5-29.2 s, 62.8-67.5 s);
  - v2 added a slow content drift (8 px), rotating sugar rings with a hovering bee, bubbles from the start of the "too watery" page, a shaking jar, and a bee circling the jar on the sign-off.
- **Search question:** spoken at 0.3 s. Hook: 7 words. "But" at 2.5 s.
- **Re-hooks:** 24.3 s "Here's the catch"; 29.6 s drying starts on the flight home; 45.8 s fanning.
- **Payoff:** 61.3 s. Question: "Did you know bees dry honey with their wings? Yes or no?"
- **Length:** 74.2 s. Voice af_heart 0.97 (the US-grade line was cut for length and moved to the caption); spec tail 0.6, so the end card is about 2.9 s.
- **Loop:** the last 0.5 s blends 30% of frame 0.
- **Sourcing:**
  - "pass it mouth to mouth" (main's note: never "vomit");
  - "about 18% water" with the 18.6% grade limit in the caption;
  - the National Honey Board page was not reachable (403), so it is not cited.
- **Badge:** EP 103 at (44, 1366), bottom at 1440, as handwarmer. Checked every 3 s: clear of all captions after the caption move.
- **Ear check:** not done by a human yet.

## qa.py
```
QA honey: PASS   (/home/user/reel-render/jobs/honey/honey.mp4, 74.2 s)
  PASS  static          longest no-change run 0.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.3 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 12.0 dB above the pauses (7 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.9 (min 1.0), contrast 25.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      honey.mp4 1080x1920 SAR 1:1; honey_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("how do bees make honey"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (7 words = the search question; frame 0 has a moving water counter; "but" at 2.5 s)
- [x] 66-86 s (74.2); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] Every claim sourced (sources_honey.md); numbers in words in the spoken text
- [x] Pinned comment + thumbnail
