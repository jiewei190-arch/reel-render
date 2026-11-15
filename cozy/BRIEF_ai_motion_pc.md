# Cozy bear: free AI motion on the owner's PC (Creator, RTX 4060 8 GB), with drift control
Owner: the puppet motion test is "not good enough"; wants FREE tools; "make it not drift".
Owner's art: `cozy/owner_character/` on origin/claude/beautiful-hypatia-0w2o96 (expressions_sheet, turnaround, main_pose, backgrounds). Kit/food/audio: origin/cozy/kit-ep01.

## Tools (free, local, commercial-OK only; check each license file before use and log it in LICENSES.md)
- ComfyUI (GPL-3, local app) + Wan 2.2 / Wan 2.1 weights (Apache-2.0). Use a quantized (GGUF/fp8) image-to-video or first-last-frame model that fits 8 GB VRAM with CPU offload. Try in this order: Wan2.2 TI2V-5B (fp8/GGUF), Wan2.1 FLF2V/VACE quantized. Record s/clip.
- ToonCrafter only if its weights' license allows commercial use; otherwise skip.
- No paid APIs, no cloud credits, no logins with the owner's accounts.

## Anti-drift rules (the owner's main requirement)
1. KEYFRAME SANDWICH: every clip uses first-AND-last-frame conditioning with the owner's OWN drawings (or poses composed from them) as both ends, so start and end are exactly on-model; AI only fills the in-between. Keep clips short (2-3 s, ~49 frames).
2. CHARACTER ON ITS OWN LAYER: animate the bear on a flat plain background (chroma colour), cut it out (rembg / color key, both free), and composite it over the owner's static room painting. The room never morphs.
3. LOW MOTION: modest motion strength / prompts with one simple action per clip ("blinks and sways", "stirs the pot slowly"); never ask for turns > 45 degrees in one clip (use turnaround drawings as separate keyframes instead).
4. AUTO-REJECT: score every frame against the reference sheet (DINOv2 or CLIP image similarity on the bear crop + nightcap colour check + outline-colour check). Reject any take whose worst frame drops below a threshold you calibrate on the owner's own drawings; render 3-4 seeds per shot and keep the best. Log scores.
5. PALETTE LOCK: colour-match every kept frame back to the owner's palette (cream body, peach ears, pink cheeks, blue nightcap, warm-brown outline) with a LUT / histogram match.
6. Where AI still fails (hands holding the spoon, egg cracking), fall back to the kit's puppet animation for that beat; mix freely.

## Step 1 (do now when the PC is on): install + ONE test shot
Shot: the bear at the low table stirring the sage pot on the burner, steam rising, 3 s, 1080x1920 (render lower and upscale with a free upscaler if needed, e.g. Real-ESRGAN anime model, BSD). Deliver `cozy/ai_test/stir.mp4` + a side-by-side with the puppet version + drift scores + timing + LICENSES.md on branch `cozy/ai-motion`, STATUS.md first line `STATE: ready`. Then wait for MAIN.
Never post, upload or log in anywhere.
