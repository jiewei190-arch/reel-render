STATE: rendered

# penny-doubles: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2** with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16, 857 frames (28.57 s).
  - AAC 256k 48 kHz.
  - Loudness **-14.1 LUFS**, true peak **-1.5 dBFS**.
  - No music, no SFX: the voice only.
- **Engine:** Remotion 4.0.540 + three.js on the GPU (`--gl=angle`), and the blocky-shorts skill template.
- **Motion blur:** 4 sub-frames (SUB=4); the shutter is 0.35 per shot, 0.2 on the coin burst (S11). SUB=2 was not needed (renders take under 3 min).
- **Code:** the project lives on the PC at `C:\Users\jiewe\blocky-render\`.
  - `src/fin/penny.tsx` is this Short (lenses, staging, counter).
  - `src/fin/{core,props,hud}.tsx` is the shared finance engine: shot/lens system, coins, piles, cash case, flip calendar, receipt, toll booth, chart board, clock, labels, hall set, holo counter, captions in script casing.
- **Cast:** PENNY, SPENDER, TELLER and SAVER from `finance/cast`. There are no game avatars, logos, brands or real people, and the bills are plain.

## Versions
| version | render | what changed | QA |
|---|---|---|---|
| stills pd1–pd6 | – | Layout and lenses found by stills (6 key frames, then the mid-frame of all 21 shots). Fixed: the counter overflowing at big numbers; the penny unreadable (now a big copper coin standing upright); the copper washing out to white; the lens inside Penny in S04; the coin mountain swallowing characters and the S19 lens; the holo tag colliding with the counter; the S15 Teller shot blocked by Spender and then by the till; S10 not showing Penny's eyes | – |
| v1 | 121 s render, 150 s total | First full render | critic 0 FAIL. Eye check found: the case falling through Spender in S18; the flying page in S20 slamming into the lens; the receipt invisible against the counter; the counter on DAY 28 while the voice says "Day thirty"; Penny's face hidden in S08 |
| **v2** | 131 s render, 163 s total | All five v1 issues fixed | **critic 0 FAIL** (SYNC: 20 cuts, max offset 0 frames; STATIC: longest still run 0 frames; EDGES: captions 11.9 % from the edge; SOUND: voice only). flicker.py: 5 spikes, all on hard cuts or the coin burst, no tab stride. Pacing: 21 shots, cuts on every anchor word |

## What's on screen
- **Counter:** a holo counter on every frame, `DAY n · $x`. It is red while the total is under $1,000,000, green once past it, and gold on day 30.
  - S01 and S21 add "vs $1,000,000 TODAY".
  - S09 adds "STILL LOSING".
  - S19 adds "DAY 30 ALONE: +$2,684,354.56".
- **Corner tag:** "THOUGHT EXPERIMENT" on every frame.
- **Captions:** in script.txt casing, Poppins ExtraBold, pop-in, 12 % side margins, about 68 % down the frame.
- **Loop:** S21 uses the same lens and world as S01 (penny on the podium, case on the counter, counter reset to DAY 1 · $0.01). The last words "every single time," run into "This penny beats a million dollars."

## Known gaps
- In S16 the counter is still ticking 29 → 30 when the voice says "Day thirty". It reaches 30 at the cut, and S17 slams 30 with a pop.
- Nobody has listened to the voice by ear yet (same as F1_STATUS).
