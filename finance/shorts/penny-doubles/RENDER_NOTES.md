STATE: rendered (FORMAT v1, PC build)

# penny-doubles: FORMAT v1 render notes (PC build, style S2 RICH-VS-POOR)

`video.mp4` sha256 `e8c2717649354bfb9a81356d1ed250a828eb734f4b4d4426b6720968277a4d4f`. 1080x1920, 30 fps, 880 frames (29.33 s), SUB=4 motion blur, 34.6 MB.
Built end to end on the PC:
- voice: Chatterbox D2 on the GPU, exaggeration 0.55, cfg 0.3;
- plan: `plan/plan_src.py`, 19 word-anchored shots;
- scene: `finance/render-pc/src/fin/v1/pennysplit.tsx`, composition `PennyDoublesV1` / `PennyDoublesV1Sub`.

These notes and video replace the old F1 render (sha 3b75f6ee, now cancelled).

## How it's built
- **Split screen:** new optional `FinSpec.split` in core.tsx; specs without it are unaffected. Two 1080x960 views of one world:
  - TOP: Spender's red vault, a fixed $1,000,000 board and a pallet of cash bricks;
  - BOTTOM: Saver's green mint, 40 m away. Its board shows the exact day value $0.01 x 2^(d-1). The coin pile's height is the cube root of the money (so volume scales with value), capped clear of Saver.
  - A DAY calendar in each half: 1, 2, 10, 20, 25, 28, 30.
- **Divider:** a red to gold to green bar at y 953–967. The 1–3 word captions sit on the divider (centre 50 %), so they never cover a face. The faces sit about 60 % down the top half and about 55 % down the bottom half.
- **Story beats:**
  - Frame 0: Spender tossing cash; Saver flipping the penny.
  - 1.3 s: the penny POPS into two coins (pop SFX); Saver's face goes curious to joy.
  - 2.5 s: the $1,000,000 board SLAMS down (impact, debris, shake).
  - 9.3 s: Spender laughs (squash).
  - 14.7 s, the open loop (50 %): "But watch the last five days..."; Saver's board is covered with "?????" and the vault dims.
  - 17.5 s: the cloth flies off and coins ERUPT (boom, slam, shake); Spender's grin drops.
  - 21.2 s: "Saver pulls ahead" (Spender jaw drop, Saver cheers).
  - 23.2 s: the day-30 avalanche, $5,368,709.12.
  - 24.6 s: the top of the pile glows: DAY 30 ALONE +$2,684,354.56.
  - 27.6 s: S19 returns to the S01 lenses and the loop lands on "Saver took a penny".
- **Emotions:**
  - Spender: joy, smug, laugh, smug, curious, shock, jaw drop, despair.
  - Saver: curious, joy, determined, happy, sly, joy, cheer.

## Pre-post gate (FORMAT_V1, frame 0 and the first 2 s)
See `frame0.jpg` and `strip_0-2s_6fps.jpg`.

| check | result |
|---|---|
| close-up >= 50 % of the frame, mid-action | yes. TOP: Spender's face and torso fill the half while he tosses cash bricks. BOTTOM: Saver's face and torso fill the half, with the penny mid-flip in front of him. |
| hook text readable | yes: "1 PENNY / vs $1,000,000", 96 px Poppins ExtraBold with an outline, 2 lines, top third |
| stake on screen by 0.5 s | yes, from frame 0: the hook text plus Saver's $0.01 board |
| first word by 0.3 s | yes: "Saver" at 0.15 s (lead 0.15) |
| music and SFX at frame 0 | yes: toon3d `upbeat` bed from 0 s (ducked under the voice), whoosh plus coins at 0.00 s |
| emotion change by 1.5 s | yes: Saver curious to joy at the 1.32 s pop (squash) |
| no dark, empty or wide frame in the first 1 s | yes: both halves are close shots and lit |

## QA
- **Audio:** `tools/story_mix.py` (27 SFX cues) then `tools/mux_voice.sh`, giving **-14.2 LUFS, true peak -1.5 dBFS**.
- **Whisper (small) on the final mix:** every word of script.txt in order. It hears "Spender's still way ahead" as "weigh ahead" (same sound).
- **Voice QA:** `verify_words.py` flags only "Saver" heard as "savor" (homophone); the strict per-line QA also flags digit formatting ("$5.12") and the apostrophe ("Spenders").
- **Critic:** 0 FAIL. SYNC 18/18 cuts exact; STATIC longest still run 0 s; EDGES captions 17.8 % from the side. frac_still 0.073.

## Clipping checks (on the final v2)
- **`node tools/story_qa.mjs`:** 880 frames x 4 sub-frames, **0 clips**. It checks heads, torsos and arm/hand boxes for both actors against:
  - the tossed cash bricks;
  - the penny coins (flip and palm);
  - the erupting and avalanche coins;
  - the coin pile, the cash pallet and both boards;
  - the DAY 30 sign.
- **Fixed in the scrub (v1 to v2):** in S02 the two popped coins sat inside Saver's forearm. They now float above and in front of his palm (hand + 0.24 m up, + 0.14 m toward the lens), and the flip arc starts clear of the hand. Both now have QA boxes.
- **By eye:** the 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-29s.jpg`) and the impact frames plus 2 (`scrub_impacts.jpg`: 1, 40, 74/75, 117, 351, 525/527, 697/699).
  - Feet are on the floor in every shot.
  - The pile never reaches Saver; the closest gap is 0.26 m at day 30.
  - Bricks fly up and back, away from Spender's head.
  - Coins in front of Saver stay clear of his hands, head and body.
  - No sign is inside anyone.

Not uploaded. It waits for MAIN QA and a BM GO.
