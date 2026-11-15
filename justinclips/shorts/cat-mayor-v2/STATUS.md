STATE: ready

# The Cat Mayor of Alaska (cat-mayor-v2) — status

- `video.mp4`: 1080×1920, 24 fps, 607 frames, 25.29 s, H.264 + AAC, 12 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 6m40s).
- Audio: mix.py (music `toon3d:upbeat`, 33 SFX cues) → −14.2 LUFS integrated, true peak −1.4 dBTP; `build/mix.wav` muxed onto the full silent render with `-c:v copy` (all 607 frames kept).
- Length: 25.3 s vs the brief's ~22 ± 3 s target: 0.3 s over. Already cut from the owner's ~27 s draft (dropped "Every afternoon", the candidates' reason, "four presidents" and "Subscribe for more."). Every brief "Keep" item is still spoken.
- Voice: Chatterbox D2 (exag 0.3, cfg 0.3), 8 lines, `--gap 0.2 --lead 0.1 --beat 0.4`. Whisper QA passed lines 1, 3-8 (seed 7). Line 2 is marked "QA FAIL" only because Whisper spells the name "stubs"; the audio says "Stubbs". To get "Talkeetna" said right (tal-KEET-na), the TTS was fed "Tal-keet-na". Seed 11 was kept, and Whisper heard "Talkeetna" exactly. Captions and `script.txt` keep the real spelling.
- "Subscribe for more." dropped: the D2 take ran 1.3 s, over the ≤ 1 s rule, and the loop is cleaner without it.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = grumpy Stubbs with his paw raised at the MAYOR desk, top caption "he drank from a wine glass" (see `contact_sheet.png`, first tile).

Re-render, from whatif/aitrends-2d-studio (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`; mix.py needs scipy, e.g. the chatterbox venv python):
    node render.mjs --project projects/cat-mayor-v2 --out projects/cat-mayor-v2/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/cat-mayor-v2 --video projects/cat-mayor-v2/build/video_silent.mp4 --out projects/cat-mayor-v2/out/video.mp4
    ffmpeg -i projects/cat-mayor-v2/build/video_silent.mp4 -i projects/cat-mayor-v2/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted anywhere.
