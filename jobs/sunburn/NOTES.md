# sunburn: NOTES (EP 93)

- **Template:** #10 paper-popup (Lemo paper-popup grammar), on the stomachgrowl kit.
  - Its own sunny palette (orange cover, sandy and sky-blue beach boards), at main's request so it doesn't look like stomachgrowl (EP 41) or microwavecenter (EP 74), which use the same kit.
- **UV:** drawn as violet zig-zag arrows, the one thing in the book that is "light you can't see"; they poke straight through the paper clouds.
- **Acts (each folds flat and pops back up):**
  - frame 0: a grey beach page; a big pink-faced paper kid; two paper clouds with the sun peeking; UV arrows poking through onto the kid; sign "Cloudy... but burned?" → "Light you can't see";
  - UV light: a slice of skin; UVB stops at the top layer (burn: redness, blisters); UVA goes deeper;
  - thin vs thick cloud: three arrows through the thin one, one through the thick one ("blocks more, not all"); a cool thermometer for "you can't feel UV";
  - Check the UV index: the dial needle climbs while the thermometer reads 18°C; "3+ = protect"; late AM / mid PM clocks;
  - UV bounces: water, sand and snow flaps send arrows back up; snow "up to 80%"; the kid hit from above and below;
  - payoff: a cloud hides the sun but not the arrows, "Clouds hide the sun, not the UV"; then the general basics (UV dial, umbrella/shade, shirt, SPF), with no product or medical claims;
  - the question (YES / NO); the end card.
- **Layout:**
  - hanging signs from y 340 (strings only above); cards y 260-1230;
  - caption paper strip at y 1260-1420 (x 80-900); nothing below y 1440 or in the right column.
- **Search question:** spoken at 0.35 s. Hook: 9 words. "But" at 2.8 s.
- **Re-hooks:** 23.3 s "Here's the catch"; 44.0 s "UV bounces"; 48.7 s snow 80%.
- **Payoff:** 54.9 s. Question: "Ever burned on a cloudy day? Yes or no?"
- **Length:** 71.3 s (two sourced lines added: WHO on what a burn is; EPA/CDC on the midday peak). Voice af_heart 0.92; spec tail 0.6, so the end card is 2.9 s. Popup bed 96 bpm; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.5 s blends at most 35% of frame 0.
- **Sourcing:**
  - "up to 80% of UV passes through clouds" was NOT used (no official page found); the 80% in the reel is WHO's figure for fresh snow.
  - Protection advice stays at CDC/EPA's general sun-safety basics.
- **Badge:** EP 93 at ("R", 260) = (651, 260), as stomachgrowl; it sits over the sign strings only. Checked every 3 s.
- **Ear check:** not done by a human yet.

## qa.py
```
QA sunburn: PASS   (/home/user/reel-render/jobs/sunburn/sunburn.mp4, 71.2 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 18.2 dB above the pauses (6 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.9 (min 1.0), contrast 50.2 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      sunburn.mp4 1080x1920 SAR 1:1; sunburn_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("can you get sunburned on a cloudy day"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (9 words = the search question; frame 0 is a big burned kid with UV through the clouds; "but" at 2.8 s)
- [x] 66-86 s (71.3); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (35% frame-0 blend)
- [x] Every claim sourced (sources_sunburn.md); numbers in words in the spoken text
- [x] Pinned comment + thumbnail
