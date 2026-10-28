# moonday: why can you sometimes see the Moon during the day? (Batch N, worker H3)

- Template: **#22 Paper stop-motion ledger** (demo t22, x.com/_nikolajankovic "Through DeFi Saver's eyes"; no source code, built from the demo frames in Canvas2D). Why: the demo explains a hidden schedule with graphite drawings, typed slips, a gauge and a moon-and-stars night sky; "when is the Moon up?" is exactly a log of times and a gauge of brightness. Not used in the last ~8 EPs.
- Taken from the demo:
  - off-white paper with fibres and a soft vignette;
  - graphite pencil lines that boil on every frame at 12 fps, with all motion stepped at 12 fps (stop motion);
  - coloured-pencil hand labels (blue, red, ochre);
  - typed paper slips with a soft shadow that slide in on 12 fps steps;
  - the pencil thermometer gauge with labelled lines (here: Moon / daytime sky / stars by brightness);
  - the crescent Moon with plus-sign stars;
  - the taped paper caption strip, typed on.
- Length 76.5 s; af_heart 0.97; music crayon 84 bpm at music_gain 0.62; fx_gain 0.4. Final audio: alimiter 0.75 + AAC 128k (the 72k encode overshot to -0.9 dBTP).
- Code: reels/t_moonday.js, t_moonday.html, specs/moonday.json, ev_moonday.json, tl_moonday.js.
- Batch N layout: sky y 250-1100 over a pencil horizon; caption strip y 1160-1352 (text x 100-890); badge strip y 1366-1440 on the hatched field (fence, grass tufts and a little house below, no text). Right-column labels all sit above y 840.
- Loop ending: in the last 0.5 s, the frame-0 sky (half Moon, Sun, "3:30 pm") dissolves in at most 40%.
- Demand signal: "why is the moon out during the day" / "why can I see the moon in the daytime" is an evergreen sky search.
- Structure:
  1. Frame 0: a half Moon and the Sun at 3:30 pm, with a slow push-in, a waving stick figure and a passing cloud.
  2. Night vs day split page ("night only?" crossed out).
  3. The Moon reflects sunlight and is bright enough to shine through the blue sky; the stars are lost in the glare; the brightness gauge.
  4. "When is it up?" on a 24-hour clock, then the twist at 25.1 s: it's tied to its orbit (diagram).
  5. A typed moonrise log (+50 min a day, labelled "about"), the rise time sliding around the clock, and the bars: almost as much time in the day sky as at night.
  6. Re-hook at 44.7 s: some days are better (four phase slips). New Moon is lost in the glare; the first quarter rises around noon and glows all afternoon (the wow); the third quarter is in the morning sky.
  7. Payoff at 62.3 s: its own schedule (the clock's Sun and Moon hands drift apart); "look up"; "Spotted?"; end card.

## Approval notes applied / standing checks
- Big moving frame 0: the Moon at r 130 with a 12 fps push-in, a waving arm and a cloud crossing; frame-0 contrast 19.2.
- No near-identical shot held over 6 s: the second scene is a night/day split page instead of a repeat of the frame-0 sky.
- Stronger blue pencil sky, so mid-frame is never empty paper. Blank frames PASS.

## Softened / not used
- Moonrise clock times are illustrative and labelled "(about)". No numbers on the brightness gauge or the day/night bars ("almost as much", per NASA). No hemisphere caveat in the voice; the drawings show the northern-hemisphere orientation (first quarter lit on the right).

## QA (python3 -I reels/qa.py moonday)
```
QA moonday: PASS   (/home/user/reel-render/jobs/moonday/moonday.mp4, 76.5 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.8 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.0 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.0 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 18.7 (min 1.0), contrast 19.2 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      moonday.mp4 1080x1920 SAR 1:1; moonday_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- Badge: moonday_ep.mp4 EP 72 at (44, 1366); frames at 6/25/45/76 s checked, clear of all text.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (10-word first line; frame 0 the half Moon beside the Sun at 3:30 pm; "But" at 3.8 s; search question spoken at 3.8-6.9 s)
- [x] Re-hooks at 25.1 s and 44.7 s; payoff 62.3 s
- [x] 66-86 s (76.5 s); ends on the exact closing line
- [x] One-word question before the closing line ("Spotted?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 sky dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_moonday.md written
- [x] moonday_ep.mp4 (EP 72, spot (44, 1366))
- [x] Sources: NASA + two university pages (sources_moonday.md)
