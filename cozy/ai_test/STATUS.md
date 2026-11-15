STATE: ready

# AI motion test, step 1: the bear stirring the pot (3 s), made on the owner's PC with free local AI
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
