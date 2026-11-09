STATE: render-on-pc

# neutron-teaspoon (Justin clips Short #14): "This Teaspoon Weighs a Billion Tons 🥄"
Project ready for Creator (PC GPU). Branch `justinclips/batch2-d`. Commit: the one that added this file (see `git log -1 -- justinclips/shorts/neutron-teaspoon/STATUS.md`).

## Expected output
- 1080x1920, 24 fps, **629 frames, 26.21 s** (voice 26.20 s). -14 LUFS, true peak <= -1 dBFS (preview mix: -14.3 LUFS, peak -1.5 dBFS).
- mix.py's `-shortest` mux drops 3 frames (626), so the final file = the full silent render + the mixed audio stream copied in (step 3).

## Commands (run from `whatif/aitrends-2d-studio`)
```
# 1. full render (~629 frames; Creator adds --gl gpu)
node render.mjs --project projects/neutron-teaspoon --gl gpu
#    -> projects/neutron-teaspoon/build/video_silent.mp4 (check: 629 frames)
# 2. mix (voice + toon3d:curious music + 29 sfx cues, -14 LUFS, TP -1.5) to an explicit path
python audio/mix.py --project projects/neutron-teaspoon --video projects/neutron-teaspoon/build/video_silent.mp4 --out projects/neutron-teaspoon/out/neutron-teaspoon_mixed.mp4
# 3. final = full silent video + mixed audio, both streams copied
ffmpeg -y -i projects/neutron-teaspoon/build/video_silent.mp4 -i projects/neutron-teaspoon/out/neutron-teaspoon_mixed.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart ../../justinclips/shorts/neutron-teaspoon/video.mp4
# 4. checksum
cd ../../justinclips/shorts/neutron-teaspoon && sha256sum video.mp4 > video.sha256
```

## Checked in the cloud (half-size preview `neutron_teaspoon_preview_540x960.mp4`, `contact_sheet.png`)
- Frame 1 = Dev already straining at the glowing spoon (sweat drops, push-in); Line 1 "This teaspoon weighs about a billion tons." (7 words) at 0.15 s.
- Twist "It's a spoonful of a dead star." at 3.1 s. 13 shots, a new visual every 0.65-3.3 s.
- BEANMEN FX: window god rays + warm tint in the lab, sunny sky + clouds + god rays on the balance shot; reactions: sweat, "!", "???",
  sparkle, ripples + speed lines, flash on "explodes", "!" + camera shake on "Combined.", dizzy stars on Dev.
  Inserts: bigtext "1-3 SUNS OF MASS / 20 KM wide", counter "1,000,000,000 TONS (about)". Transitions: whipBlur x4, iris (open + close), flash, cut on the punchline.
  BEANMEN beat: "Wait. How?" -> "You see, ...". Music `toon3d:curious`, sfx on words (ding on "billion", boom on "explodes", thud on "Combined.").
- Captions 1-3 words at 66 % height: clear of the right-hand buttons and the bottom title zone in every frame of the contact sheet (red boxes).
  Numbers as digits: "1 billion tons.", "20 km". Whisper check: "a billion", "twenty kilometers" spoken as words (no digit read-outs).
- Payoff "Dev tries to lift it." / "Dev does not lift it." at 21-24.5 s; closer "Subscribe for more." 1.1 s; the last shot returns to the frame-1 close-up (loop).
- Voice: Kokoro am_fenrir 0.95 (`whatif/voice/fenrir.py --gap 0.3 --comma 0.15 --lead 0.15 --section 0.75`), 0.75 s beats before the punchlines.
- Sources: `sources.md`. Upload text: `UPLOAD.md`. Nothing was posted or uploaded.
