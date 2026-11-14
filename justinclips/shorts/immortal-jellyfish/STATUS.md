STATE: ready
# immortal-jellyfish: "Immortal Jellyfish: The Animal That Never Dies of Old Age" (Justin clips, Toon 3D + BEANMEN effects, Chatterbox D2)
- **Final:** `video.mp4` 1080x1920, 24 fps, 958 frames, 39.92 s, H.264 + AAC 192k, 27 MB. **-14.5 LUFS, true peak -1.4 dBFS.**
  `video.sha256`: `a0443bf2da449f28a84ef8d468e93e06d893e5cac8f4f6380044b72baa9202a3  video.mp4`. No split needed (< 95 MB). The full silent render and mix.wav were muxed with `-c:v copy`; all 958 frames were kept (the audio was padded, not `-shortest`).
- **Voice: Chatterbox D2** (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15`. Every part passed Whisper QA (seed 7; "lunch" seed 11).
  The final mix was re-checked with Whisper small.en, and it matches the voice script word for word, including "transdifferentiation". No years or numbers are spoken. The 4.5 mm figure appears only on a chip.
- **Fact fix (vs. the brief):** line 7 "The catch? Everything eats it." became "The catch? Fish and turtles eat it." No source says "everything"; the NHM names fish and turtles (polyps: sea slugs, crustaceans).
  All other lines held up against the NHM, The Conversation and DNA Research 2022 (sources.md). "In theory" was kept on "forever". There is no "only animal" claim. BBC Future could not be loaded from the cloud, and the other sources cover every claim.
- **MAIN edits applied:** the voice says "the immortal jellyfish"; "Turritopsis dohrnii" appears on a chip in s03; the last line does not say "only".
- **Effects:** a mood-lit dark sea for the hook and closer, a sunlit sea with light rays for the main shots, and the kit's sunny preset + god rays for the butterfly meadow (s10).
  Reaction FX after every reveal (stars, sweat, ???, !, hearts, sparkle, shake, flash, ripples, spotlight, speedlines). Insert cards: FOREVER (s12) and LUNCH (s16, kit bigtext), plus the TRANSDIFFERENTIATION stamp.
  Transitions: whipBlur, iris, flash and dissolve. Music bed `toon3d:curious` with 46 kit sfx cues, many on spoken words. Nothing is shown being eaten or hurt.
- **Loop:** the closer "Subscribe for more." runs 38.38-39.6 s (1.2 s). The last frame matches the frame-1 framing, then a hard cut to frame 1.
- **Checked:** `contact_sheet.png` (22 frames of the preview; red boxes = Shorts UI zones: frame 1, captions vs UI, FX, last frame) and `preview_540x960.mp4`. Fixes after that check: captions are hidden under the TRANSDIFFERENTIATION stamp and the LUNCH card; s04 was reframed.
- **Rendered in the cloud** (owner's PC unreachable): SwiftShader, 4 workers, 10m30s.
  Re-render: `node render.mjs --project projects/immortal-jellyfish --out projects/immortal-jellyfish/build/video_silent.mp4` (add `--gl gpu` on the PC), then `python audio/mix.py --project projects/immortal-jellyfish` and mux mix.wav with `-c:v copy`.
- Project: `whatif/aitrends-2d-studio/projects/immortal-jellyfish` (voiceover.wav force-added). Nothing was posted, uploaded or logged into.
