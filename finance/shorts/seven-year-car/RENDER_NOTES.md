# seven-year-car: render notes (cloud CPU, style S7 bleep gag / S1 story, voice Christopher)

## v1 (2026-11-19)
- sha256 b45ddaa8a3eaa858f919691c8b2c986d39d86b5853f53458a0a8aef59619eec8; 1080x1920, 30 fps, 885 frames, 29.50 s video and audio, 22.2 MB. I -14.1 LUFS, true peak -1.6 dBFS (mux_voice.sh, pass 1).
- **Rendered on the cloud CPU because the PC was offline.** `SevenYearCarRecipeSub` (SUB=4 motion blur, quality pass) was rendered with `--gl=swangle --concurrency=4` in output-frame chunks, then spliced and run through render.sh's own tmix/select/x264 step (crf 16, slow). Each chunk took ~41 min, about 11 s per output frame.
  - Re-render patches after the scrubs: 0-106 (frame-0/loop framing, S02 reframe), 252-473 (S06 boards, S08 stamp, S09 board), 774-847 (twist restaged).
  - Every segment's sub-frame count was verified before the splice. The splice seams are invisible in the 6 fps scrub.
- **Voice:** voice.wav as delivered, not re-voiced. The bleep is baked in at 16.24-16.78 s over "freaking". vo/timings.json is from the clean take. No ElevenLabs characters were used.
- **Mix:** `STORY_CUES=out/tmp/seven-year-car.endclear.cues.json python tools/story_mix.py`, with the toon3d library (origin/iawaken/toon3d-fx).
  - Music bed: upbeat, ducked under the voice.
  - End cues after 29.0 s: the impact and whoosh were dropped and the thud lowered to -12 dB, so the last word "with..." stays clear (the credit-score-car lesson). There is still an impact at the bleep's slam zoom; the bleep window peaks at -6.5 dBFS.

## Recipe and engine
- `recipe.json`: 18 shots, street set, cast SPENDER (red) + SAVER (green, glasses), the same red CC0 car-sedan behind each, eggs cat + sticky "84 MONTHS?!", catCoin final gag, extras off (walkers clip cars).
- **Engine addition (additive, no other Short changes):** an `angry` face emotion in `src/blocky/Blocky.tsx` (+ the `Emotion` type in `blocky/motion.ts` and `fin/recipe/types.ts`).
  - The face has slanted-lid glaring eyes, thick low inner-down brows, gritted teeth and a red anger mark.
  - The existing emotions are unchanged. tsc is clean.
- **Hook:** "$12K FOR A LOW PAYMENT?" (5 words). The "$563/MO" chest tag slams at 0.10 s, the first cut is at 1.00 s, and the INTEREST $12K block drops on "twelve".
- **Disclaimer:** the tag reads "EXAMPLE - 9% APR, $35K" from 1.0 s to the loop.
- **BLEEP BEAT (test variable)** is 3 shots with fixed captions:
  - **ARE YOU:** an angry close-up.
  - **#$%&!:** 16.24-16.80 s. A cut to a slam-zoom (fov punch-in) plus four shake hits (16.26/16.38/16.50/16.62). Arms are flung up, the face is angry, and a black "#$%&!" censor bar sits over the mouth.
  - **KIDDING ME?:** still fuming, with a shake on "me".
  - The word "freaking" never appears on screen. Fixed captions end in a zero-width space so the caption renderer keeps the "!" and "?".
- **Open loop at 17.6 s (60 %):** two covered "INTEREST $???" boards, apart and inside the frame. The reveal comes at 21.7-25.8 s: Saver $6,807 and Spender's counter to $12,302.
- **Twist:** SAVER $6,807 vs SPENDER $12,302 blocks, with a solid red "ALMOST 2x" board slamming on "double".
- **Loop:** back to the frame-0 close-up. The "$563/MO" tag lands on the last word "with" (29.12 s; the word starts 29.10 s). The frame-0 and loop close-ups use cam.face 0.33, so the chest tag sits above the bottom-centre caption band.

## QA
- **RECIPE_QA.md:** clip QA 885 frames x 4 sub-frames, 0 clips. The frame-0 gate passes in full, including the hook rule (first cut 1.00 s; loop board on the last word) and caption centre >= 65 % on 100 % of caption time. The frame-edge WARN is clean.
  - One warn remains: S02's INTEREST block reaches into the caption band. Its text sits above the band and the block is a floor prop.
- **Off-screen boards:** the edge check skips props that are entirely out of view. The first close-up boards were off-screen and passed the check. A projection probe was used to place every close-up board above the eyes, and each one was checked by eye in the renders.
- **By eye:** 6 fps scrub (`scrub_6fps_*.jpg`), `strip_0-2s_6fps.jpg` and `frame0.jpg`.
  - Captions stay in the bottom band, no caption covers eyes or a mouth, there are no clipped or cropped boards, and avatars stand on the floor.
  - On the bleep shot the flung arm passes close to the lens as a large pink block (motion, not a clip).
  - Frame 0 is the hookZoom start; the hook text box overlaps the antennae, not the face.
- **Audio:** silencedetect (-40 dB, 0.6 s) found no gaps. Audio and video are both 29.50 s.
  - Whisper was not run: it isn't installed in this container. The voice is MAIN's delivered file, unchanged.
  - I can't hear audio, only measure it.

Not uploaded. It waits for MAIN QA and a BM GO.
