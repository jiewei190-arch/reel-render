STATE: rendering

# The Crow Grudge — status

Final video rendered in the cloud (owner's PC "Creator" was off) and pushed.

- `video.mp4`: 1080×1920, 24 fps, 996 frames, 41.5 s, H.264 + AAC, 21 MB (no split needed). sha256 in `video.sha256`.
- Audio: mix.py master −14.5 LUFS integrated, true peak −1.4 dBTP. Voice Kokoro am_fenrir; music toon3d:mystery; 37 kit sfx cues.
- Checked: frame 1 is moving (net dropping) with the hook text; captions 1–3 words in the lower middle (y 0.72), digits for years, ALL CAPS only on "17 YEARS" and the loop line; Whisper confirms the years are spoken naturally ("2006", "17 years", "2023").
- Loop: hard cut at the end (no fade). The last shot ends on the crow staring into the lens, then frame 1 says "2006".
- Tone: comedy only. Crows swoop past and scold; nobody is shown hurt; the Cheney mask is a neutral cartoon control.

Re-render (if needed, e.g. on the PC with `--gl gpu`), from whatif/aitrends-2d-studio:
    node render.mjs --project projects/crow-grudge --out projects/crow-grudge/build/video_silent.mp4
    python3 audio/mix.py --project projects/crow-grudge --video projects/crow-grudge/build/video_silent.mp4

Deliverables: script.md, sources.md, UPLOAD.md, preview_540x960.mp4 + contact_sheet.png (from the final), video.mp4, video.sha256.
