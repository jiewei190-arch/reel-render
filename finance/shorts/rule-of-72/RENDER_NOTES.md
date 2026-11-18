STATE: rendered

# rule-of-72: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2** with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16, 714 frames (23.8 s).
  - AAC 256k 48 kHz.
  - Loudness **-14.2 LUFS**, true peak **-1.5 dBFS**.
  - No music, no SFX.
- **Engine:** the same shared engine as penny-doubles (`finance/render-pc/src/fin/`). This Short is `src/fin/rule72.tsx`.
- **Motion blur:** SUB=4; the shutter is 0.2 on the chop (S03).
- **Set:** a teal maths workshop.
  - A chalk-green board on the back wall: "72 ÷ RATE ≈ YEARS TO DOUBLE" painted from frame 0, plus the current sum.
  - A podium.
  - A green bench of coin jars (saving) on the left; a red "$" debt stack on the right.
  - A "RATE %" neon sign that flickers on in S04.
- **Cast:** SAVER, PENNY, SPENDER and LENDER from `finance/cast`. No logos or brands; the card is plain red with "24% APR / EXAMPLE".

## Versions
| version | render | what changed | QA |
|---|---|---|---|
| stills r1–r6 | – | Fixed: the hoisted 72 block hiding behind the counter, and later Saver's face behind the captions (S01/S17); the neon missing in S04; weak jars and the holo tag colliding with the counter (S06); Saver off-frame at the stamp (S10); the card macro not showing the card (S13); Lender with his back to the lens (S14); Penny's rate card above the frame | – |
| v1 | 127 s render, 149 s total | First full render | critic 0 FAIL. Eye check: the rate card was still mostly off-frame, and the captions covered Saver's face in S01/S17 |
| **v2** | 98 s render, 120 s total | Lower hoist and framing in S01/S17; a bigger rate card in Penny's other hand | **critic 0 FAIL** (SYNC: 16 cuts, offset 0 frames; STATIC 0; EDGES: 10.4 %; SOUND: voice only). flicker.py: 4 spikes, all on cuts, no stride |

## What's on screen
- **Counter:**
  - "72 ÷ RATE = YEARS", then "72 ÷ 6 = 12 YRS", "72 ÷ 8 = 9 YRS" and "72 ÷ 12 = 6 YRS" in green.
  - "AN ESTIMATE" is added in S10–S11.
  - "72 ÷ 24 = 3 YRS" in red in the debt half.
  - S16 shows both lines.
- **Corner tag:** "24% APR · EXAMPLE" in S12–S15.
- **Loop:** S17 uses the same lens as S01, with Saver lifting the 72 block again. "So remember..." runs into "Seventy-two tells you…".

## Known gaps
- Penny's rate card is fully readable only in S05; in S07 and S08 it's partly off the frame edge. The counter carries the numbers.
