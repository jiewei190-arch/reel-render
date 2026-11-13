STATE: rendering
# tardigrade-space: "Tardigrade: The Animal That Survived Space Naked" (Justin clips, Toon 3D + BEANMEN effects), RE-VOICED with Chatterbox D2
- **Final:** `video.mp4` 1080x1920, 24 fps, 914 frames, 38.08 s, H.264 + AAC 192k, 17 MB. **-14.4 LUFS, true peak -1.3 dBFS.**
  `video.sha256`: `a2e5aee7d3f816f67e1ba152f7fcb6996f684b4a3b40d60e9260f256a287257d  video.mp4`. No split needed (< 95 MB). Full silent render + mix.wav muxed with `-c:v copy` (no frame loss).
- **Voice (owner's pick, Nov 13): Chatterbox D2** (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15`.
  Voice script = the owner's 8 lines (identical to the voice-test proof take, same seeds/timings) + "9. Subscribe for more." Every part passed Whisper QA (seed 7).
  Held 0.7 s beats before "and the animals were alive", "naked", "is this guy". Closer "Subscribe for more." 36.72-37.92 s (1.2 s), then hard cut -> loop to frame 1.
- **QA (Whisper small.en on the final mix):** "In 2007, scientists strapped tiny animals to the outside of a satellite. No suits, no oxygen, just open space for 10 straight days.
  The radiation out there is a thousand times stronger than on Earth. When the satellite came home, they checked the bodies, and the animals were alive, some even laid eggs.
  They're called tardigrades. Half a millimeter long, lives in moss, looks like a gummy bear with eight legs. And now it's the first animal in history to survive outer space.
  Naked, which means the toughest astronaut ever. Is this guy? Subscribe for more." = the script word for word; "2007" is spoken "two thousand seven".
  (First mix had "They're called" masked -> music bed -18 -> -21 dB, pop on "eggs" -6 -> -12 dB, whoosh/slide next to it removed.)
- Re-timed to the new VO: transcribe (timeline/words.json), all 19 shot cuts, sfx word cues, insert continuations, DAY counter. Same script, shots, captions, effects, packaging.
- Checked: `contact_sheet.png` (20 frames of the final render, red = Shorts UI zones: frame 1, captions vs UI, FX, last frame = frame-1 framing) and `preview_540x960.mp4`.
- Rendered in the cloud (owner's PC off): SwiftShader, 4 workers, 10m59s. UPLOAD.md: only the duration changed (cover frame 0.5 s / alt 32.0 s still valid).
- Fact notes: sources.md (unchanged). Project: `whatif/aitrends-2d-studio/projects/tardigrade-space` (voiceover.wav force-added; `input/make_voice.py` = the old Kokoro take, superseded).
  Re-render: `node render.mjs --project projects/tardigrade-space --out projects/tardigrade-space/build/video_silent.mp4` (add `--gl gpu` on the PC), then mix.py and mux mix.wav with `-c:v copy`.
- Nothing was posted, uploaded or logged into.
