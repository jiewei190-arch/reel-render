STATE: ready

# COOKING TEST (MAIN job, 2026-11-15): `cooking_test.mp4`, 14.0 s, 5 shots, made on the owner's PC with free local tools
Nothing was posted or uploaded, and nothing was logged into. No paid tools. No new downloads (Real-ESRGAN not used; Lanczos/canvas scaling as asked).

| file | what |
|---|---|
| `cooking_test.mp4` | 1080x1920, 24 fps, **336 frames = 14.00 s**, AAC 48 kHz. **-14.1 LUFS, peak -1.7 dBFS**. sha256 `dfdd11725bae5f56aa19ac6507ebd288f0023a70da8a5bc0cd4c9adb2b4dd56a` |
| `cooking_test_sheet.jpg` | contact sheet, one frame per second (14 tiles) |
| `cooking_drift_scores.json` | per-take DINOv2 / nightcap / outline checks for the 3 AI shots, kept take, scores after the palette lock |
| `cooking/project/` | the kit project (config, `story/shots.json` with sfx + beds + lo-fi, `scenes/shots/cooking.js`) |
| `tools/make_keys.py`, `tools/ai_layers.py`, `tools/make_fg.py` | keyframes from the owner's tiles; score/reject/palette-lock/export the AI bear layer; cut the owner's stove+bowl and table as foreground layers |

## Shots (one pinned top caption "When the 2AM / hunger hits..." the whole time, a cut every 2.5-3 s)
| # | time | what | how |
|---|---|---|---|
| 1 | 0-3.0 | wide: bear behind the low table, burner **clicks** on at 1.0 s, blue flame + sparkle, bear glances at it and ends on the "o" face | **AI**: first frame = owner's `happy`, last = owner's `o`; flame = owner's stove with the flame painted out, then faded back in |
| 2 | 3.0-5.5 | insert: egg drops, **cracks**, splits, raw egg into the buttered pan | kit `egg` + `panTop` + `friedRice` (no bear, as MAIN allowed: AI paws holding an egg were not tried) |
| 3 | 5.5-8.5 | top-down money shot: rice + ham + scallion sizzling, egg scrambling, cheese slice drops and melts, sesame | kit food helpers, slow push-in, whip transition |
| 4 | 8.5-11.0 | the bear stirs the sage pot; **steam now rises from the pot rim** (left side, away from the face) | **AI**: the passing stir take (seed 11) |
| 5 | 11.0-14.0 | the bear tastes from the spoon, eyes closed in bliss, chewing, **hearts** pop | **AI**: first = last = owner's `eat_spoon` drawing |

## Issue 1 fixed: the bear stands BEHIND the table now
- I cut the owner's own stove + bowl (closed by its brown outline) and the table (y >= 1092) from `bg_table_empty.png` into foreground layers, and draw them **over** the bear layer.
- Shots 1 and 5: the bear is placed lower, so its legs are hidden by the table.
- Shot 4: the owner's drawing has the pot at the bear's feet, so the pot must sit on the burner. Right of the pot, the bear's feet are replaced by its tummy row continuing straight down (`ai_layers.py --stand-cut`); the stove front, bowl and table cover the rest. The bear reads as standing behind the stove.
- In shot 4 the bear is slightly smaller (1.3x instead of 1.55x) so the nightcap stays clear of the caption.

## Auto-reject results (same rules as step 1: DINOv2 threshold calibrated per shot on the owner's other drawings, nightcap and outline 0.6-1.6x)
| shot | refs | threshold | seed 11 | seed 22 | seed 33 | seed 44 | kept (after palette lock) |
|---|---|---|---|---|---|---|---|
| 1 | happy, o | see json | **PASS** 0.926 | REJECT nightcap 1.76x (by eye: glasses-like eyes) | REJECT nightcap 1.66x | REJECT nightcap 1.99x (face changes shape) | seed 11: mean 0.958, worst 0.931 |
| 4 | stir_pot | 0.709 | **PASS** 0.915 | REJECT | REJECT | REJECT | seed 11: mean 0.956, worst 0.914 |
| 5 | eat_spoon | see json | **PASS** 0.834 | REJECT nightcap 1.60x | REJECT nightcap 1.67x | REJECT nightcap 1.70x | seed 11: mean 0.950, worst 0.834 |

- Honest note on shot 5: by eye, the three rejected takes also looked on-model. They were only just over the nightcap limit, so the nightcap check may be a bit strict for this pose. The rule was kept as is.
- Shot 1, seed 11: the bear glances sideways with visible eye-whites mid-shot. That's a small off-sheet expression, but it reads as cute.

## Audio
Kit `cozy_audio.py`: click, whoosh, crack, eggdrop, stir, plop, butter, bloop, slurp, munch, chime and pop. There's a sizzle bed from 3.3 to 11 s and the generated lo-fi bed (76 bpm). Two-pass loudnorm -14 LUFS, then re-muxed with a limiter, because the AAC encode had pushed the sample peak to -0.3 dBFS.

## PC time
- AI: 8 new takes at ~3.2 min each = 26 min (shots 1 and 5, 4 seeds each). Shot 4 reused the step-1 takes.
- Scoring and export: ~2 min per shot on the CPU.
- Kit render: 47 s for 336 frames (GPU). Audio: ~10 s.
- Re-render after a code change: `cd whatif/aitrends-2d-studio && node render.mjs --project ../../cozy/ai_test/cooking/project --gl gpu && python kits/cozy/tools/cozy_audio.py --project ../../cozy/ai_test/cooking/project`. The AI layer PNGs and fg layers are gitignored (68 MB); regenerate them with `tools/ai_layers.py` and `tools/make_fg.py`.

## Open for MAIN / the owner
- Upscale: the AI bear is still 640 px, scaled about 1.3-1.6x with canvas smoothing. Real-ESRGAN still needs the owner's OK.
- Shot 2 uses the kit's egg (drawn in code), not the owner's art. The pan is the kit's sage pan, top-down.
- No ingredient labels yet (Didi-style pills exist in the kit: `K.label`).

---

# (step 1, kept below) # AI motion test, step 1: the bear stirring the pot (3 s), made on the owner's PC with free local AI
Branch `cozy/ai-motion` (based on `cozy/kit-ep01`, plus the owner's art and `BRIEF_ai_motion_pc.md` from MAIN's branch).
Nothing was posted or uploaded, and nothing was logged into. No paid tools.

## Deliverables (this folder)
| file | what |
|---|---|
| `stir.mp4` | Final shot: 1080x1920, 24 fps, **73 frames = 3.04 s**, no audio. The owner's room (`bg_table_empty`) is static, with the AI bear layer, drawn steam and the table front on top |
| `stir_vs_puppet.mp4` | Side by side: kit puppet stir (MOTION_TEST 5.3–7.5 s, looped) on the left, AI on the right. 1080x960 |
| `drift_scores.json` | Per-frame DINOv2 similarity for every take, the colour checks, which takes were rejected and why, the kept take, and its scores before and after the palette lock |
| `LICENSES.md` | Every tool and model with its license (all Apache-2.0 / GPL-3 app / MIT / BSD, commercial use OK) |
| `work/key_first.png`, `work/key_last.png`, `work/ref_bear_stir.png`, `work/ref_tiles/` | Keyframes and references cut from the owner's `expressions_sheet.png` |
| `tools/` | `prep_keyframes.py`, `comfy_nodes/wan22_first_last.py` (custom node), `run_wan.py` (queues takes), `score_and_composite.py` |

## What the PC already had (nothing new downloaded)
Comfy Desktop with ComfyUI 0.42.3 ("Horror Factory" install), Wan 2.2 TI2V-5B fp16 (10 GB), umt5-xxl fp8 and the Wan 2.2 VAE,
plus DINOv2 ViT-L in the torch cache. The ~20 GB Wan 14B first+last-frame download turned out to be unnecessary.
I ran a separate headless ComfyUI on port 8190 using the Desktop's shared models and the extra node folder in this repo,
so the owner's Comfy install was **not modified**.

## How each anti-drift rule was applied
1. **Keyframe sandwich:** the custom node `Wan22FirstLastLatent` pins latent frame 0 AND the last latent frame to the
   owner's own "stirring the sage pot" drawing (noise mask 0), so the AI only invents the frames in between. First = last
   drawing, so the clip also loops. 3 s = 73 frames.
2. **Own layer:** the bear is generated on flat chroma green (640x640). It's colour-keyed with the largest blob kept, and green spill removed.
   It's composited over the owner's static room painting at 1.55x (Lanczos). The room never morphs. The table front is re-drawn over the bear's feet.
3. **Low motion:** one simple action ("gently stirs … slow circular stirring … sways slightly and blinks"), static camera.
4. **Auto-reject:** every frame is scored with DINOv2 against the owner's drawing, plus a nightcap-blue share check and an outline-brown share check.
   - The DINOv2 threshold is calibrated on the owner's other 8 drawings (0.709–0.757 vs the stir drawing), so threshold = 0.709.
   - The colour checks allow 0.6x–1.6x of the reference.
   - Results for 4 seeds:
     | seed | result | why |
     |---|---|---|
     | 11 | **PASS** | worst-frame DINO 0.915 |
     | 22 | REJECT | nightcap 1.83x; I confirmed the face changes shape + a flash in the pot |
     | 33 | REJECT | outline 0.57x; the outline thins out |
     | 44 | REJECT | nightcap 1.67x; lopsided, squinting eyes |

     I checked the rejects by eye, and they are real drift.
5. **Palette lock:** one histogram-match LUT from the kept take to the owner's drawing (85 %), applied to every frame (no flicker).
   Kept take after the lock: mean DINO 0.956, worst 0.914.
6. **Fallback:** not needed here. The spoon and paws held up. Egg cracking or holding small props may still need the kit puppet.

## Timing (RTX 4060 8 GB, 32 GB RAM)
- **Wan 2.2 5B at 640x640, 73 frames, 24 steps:** 186–222 s per take (avg ~199 s), with model loading included in the first take.
  4 seeds ≈ 13 min.
- **Scoring, key, palette lock and composite:** ~1–2 min on the CPU.
- **Rough planning number:** ~3.3 min per 3 s take × 3–4 seeds ≈ **12 min per shot**. A 12-shot episode is about 2.5 h of PC time, which can run unattended overnight.

## Known issues / next decisions for MAIN
- **Scale and staging:** the owner's stirring drawing has the feet level with the pot bottom, so on the table the bear reads as
  standing *on* the low table, behind the burner. Fixes:
  - a stirring drawing where the bear stands behind the table (the owner draws one, or we crop the legs); or
  - sit the bear on the floor with the pot on the table.
- **Upscale:** the bear layer is 640 px scaled up 1.55x with Lanczos. It's slightly soft next to the owner's crisp room. Real-ESRGAN anime (BSD-3, ~17 MB) would sharpen it, but it's a download that needs the owner's OK.
- **Steam:** the steam is drawn in code, not AI. It now leans left, away from the face, but starts slightly left of the pot rim; it needs a small nudge.
- **Expression changes:** mid-clip the AI made the bear close its eyes happily (an on-model "bliss" face from the owner's sheet). Expect small expression changes like this.
- **No audio:** this is a motion test only; the kit's `cozy_audio.py` stir/sizzle sfx can be added at mux time.
- **Pacing for the episode** (from `research/didi_format_notes.md` on `research/shortsjail`):
  - 35–50 s total, a shot change every 2–4 s; with first+last frames, each 2–3 s shot can come straight from one AI take.
  - One top caption pinned for the whole reel.
  - Open on a wide of the room and end on the same wide with the lighting changed, so it loops.

**Waiting for MAIN before the full episode.**
