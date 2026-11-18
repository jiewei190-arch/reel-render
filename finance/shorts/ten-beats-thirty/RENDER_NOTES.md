# ten-beats-thirty: render notes (helper worker)

Composition: `src/fin/tenthirty.tsx` (Remotion + three.js, blocky-render-2 copy), comp id `TenBeatsThirtySub` (SUB=4, tmix blur). Two identical garden plots (grass, fence, flower beds), a glass coin column on a podium each, age signs; Saver (green) vs Spender (red), Penny delivers the $200 bundles; board with the 7 % staircase; TIME crane in S22. One sunny sky for the whole Short (all shots mood "earth").
Final: **v4** (`video.mp4` = v4 + voice). 1080x1920, 30 fps, 897 frames, 29.90 s.

## Versions (render only, CONC=6, SUB=4)
| v | what | render |
|---|---|---|
| v1 | first full render after one all-shots still pass | 125 s |
| v2 | opening lens closer, podiums darker, signs lower, S10/S11 cameras back, holo tags moved | 125 s |
| v3 | S23 jars reset to empty (loop match with S01) | 125 s |
| v4 | age signs lowered below the corner badge (30 YRS sign was hidden in S01/S23) | 126 s |

## Audio
tools/mux_voice.sh (MAIN's script): **-14.1 LUFS integrated, true peak -1.5 dBFS**, AAC 256k/48k, voice only.

## Critic (tools/critic.py on v4)
SYNC 22/22 cuts exact, longest still run 0.00 s, SOUND voice only.
EDGES reports 2.2 % = FAIL: false positive of the pure-white pixel test (sky clouds / a bright pedestal rim at the frame edge in the caption band; full-res crops show captions centred, never near the edge). flicker.py: 15 spikes, all intended motion (S04/S08 coin bundles, S09 sign flicker, S12/S13 board drop).

## Numbers (7 %/yr, $200 at the start of each month, monthly compounding)
Saver: 120 deposits = $34,819 at 35 (shown ≈), then grows 360 months to $282,607. Spender: 360 deposits = $245,417. Deposits $24,000 vs $72,000 (tags S10/S11, 3 vs 9 coin stacks). Matches the script's ≈$282,600 / ≈$245,400 and sources.md. Counter shows Saver (green) / Spender (red) in every shot; age signs 10 YRS / 30 YRS -> AGE 25/35/65. Corner badge EXAMPLE 7%/YR on screen the whole film; painted card HYPOTHETICAL: $200/MO · 7%/YR STEADY on the fence from frame 0.
Spender's balance during S08-S09 shows deposits ticking up ($200 ... $72,000) and stays at $72,000 until S15, when both jars roll up to the final balances (this keeps the reveal at S16-S18 where the voice says the numbers).

## Known gaps
- S02 tease shows the counter as "$ · · · ·" (blurred balances) and a tall Saver column vs a shorter Spender column.
- S01/S23 are a wide two-shot: the characters are small in frame.
- The coin bundle in S03/S04/S08 is a large floating stack in flight (stylised).
- The bag does not flatten (S15); the Spender goes grey in S09-S14 only.
