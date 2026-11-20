STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# credit-score-car: render notes (PC, style S2 RICH-VS-POOR, voice Christopher)

`video.mp4` sha256 `4378ca818e1ce6c9228b8f25dbc8cab87091e3064dd437b75dc5129e761c37b4`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 28.1 MB.

## Build
- **Voice:** ElevenLabs Christopher, voiced in the cloud (finance/next, 15e6fd4). 460 characters, 29.5 s.
  - Whisper (small.en) on the full final mix matches script.txt, with numbers as digits.
- **Recipe:** `recipe.json`, written on the PC by a helper subagent from script.md's brief and the lessons from today's scrubs, then fixed after GPU stills.
  - Set: street (cars; background walkers off: they clipped the cars).
  - Hook "SAME CAR. $6,500 MORE?".
- **Frame 0:** close on Spender grinning, a red "13.5%" tag landing on his chest (face clear).
- **Race:** $582/MO vs $691/MO, then INTEREST ≈$4,925 vs ≈$11,436 beside each head; +$6,500 label.
- **Open loop:** "Both payments look fine at first... but watch the totals" 15.3 s (52 %): covered SAVER TOTAL ? / SPENDER TOTAL ? boards, MONTH 0→60 counter.
- **Twist:** "About five thousand in interest, versus eleven and a half thousand" 24.7 s (84 %): flash, INTEREST counters ≈$4,925 vs ≈$11,436, coin piles 1:2.
- **Eggs:** cat + tv19, catCoin final gag.
- **Loop seam:** `hook.again` on the last line. The last shot repeats the frame-0 lens and tag.
- **PC fixes after stills:**
  - The frame-0 tag was cropped by the hookZoom push, or crossed the face mid-drop. It now lands on the chest from a 7 cm drop.
  - Race counters sat above the split lenses. They're now beside each head.
  - Shot-specific framing fixes.
- **Mix:** The final 3 SFX cues (after 28.8 s) were dropped from the mix (out/tmp/credit-score-car.endclear.cues.json): with them, Whisper heard the last word "car" as "card". Without them, small and small.en both hear "Same car".

## Time
- **Build:** recipe_build about 1 s per pass. About 20 GPU stills.
- **Render, on the RTX 4060 at SUB=4:** v1, render=171 s  total=205 s.

## QA
- **Gate:** `RECIPE_QA.md` 13/13 PASS.
- **Recipe clip QA:** 885 frames x 4 sub-frames, 0 clips.
- **Audio:** -14.1/-14.2 LUFS, true peak -2.1 to -2.5 dBFS. No dropouts over 0.6 s; audio and video are both 29.5 s.
- **critic.py, against the recipe cuts:** SYNC max 1 frame; STATIC 0-0.17 s.
  - EDGES may flag bright scenery or money sparkles in its 55-80 % band (street windshields and pavement, bank sparkles). These are not captions; the captions sit in the top 35 %.
- **By eye:** 6 fps scrub (`scrub_6fps_*.jpg`) and the impact frames plus 2. A face or a readable board is in every shot, and every loop ending matches frame 0.

Not uploaded. It waits for MAIN QA and a BM GO.

## 2026-11-19 re-render v3: bottom-centre captions (owner change via MAIN)
- sha256 2bd7c89c8a088a83dc3930b025464c03e4bb3427ac361d03c0818bf1759a2114; 885 frames, 29.50 s video and audio, I about -14 LUFS, TP <= -2.1 dBFS.
- Word captions are now bottom centre (engine default): chunk centre at y 1344, never below 1400, symmetric 170 px margins. The small top line (captionsTop) is removed. The engine nudges the caption per shot off faces (eyes to mouth) and text props, sampled at 5 times per shot. End SFX after 28.8 s still dropped. Open-loop shot: camera target lowered to 1.3 and dist 2.7->3.4, so the TOTAL boards are whole and sit above the caption.
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script, last word heard. silencedetect: no gaps over 0.6 s. astats flat factor 0. 6 fps scrub checked by eye: no caption covers eyes or a mouth, and text boards stay readable. I can't hear audio, only measure it.
- Known: on the loop ending (frame-0 close-up again with the hook text), the caption sits between the hook box and the head (on the forehead or antennae), because the face and chest board fill the band. Eyes and mouth stay clear.
- critic EDGES FAIL is a false positive: scenery whites (snow sparkle / car windshield) in the 55-80 % band, not caption text (the caption is 13-16 % from the edges).
