STATE: ready

# Miss Unsinkable — status

Built and fully rendered in the cloud (Toon 3D + BEANMEN FX, Chatterbox D2 voice). Nothing posted or uploaded.

- `video.mp4`: 1080x1920, 24 fps, 658 frames, 27.42 s, H.264 + AAC, 16.5 MB. sha256 in `video.sha256`.
- Audio: -14.3 LUFS integrated, true peak -1.2 dBTP (ffmpeg ebur128 on the final). Music bed toon3d:mystery, 33 word-timed SFX.
  mix.py dropped 1 frame, so mix.wav was muxed onto the full silent render with -c:v copy (658 frames kept).
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3), --gap 0.22 --beat 0.55; per-line seeds in
  projects/miss-unsinkable/input/voiceover.lines.json. "Subscribe for more." dropped (ran 1.3 s > 1 s rule; hurt the loop).
- QA: Whisper small.en on the final matches the script word for word; years read as "nineteen eleven/twelve/sixteen",
  "55" as "fifty-five". Only flag: "Jessop" transcribed as the homophone "Jessup" (audio is correct).
- Hook: frame 1 moving (sea rising up the hull, push-in) + LINE 1 + top caption up 0-4.25 s. Cuts every 1.3-2.8 s.
  Payoff in the last 2 s, hard cut back to frame 1.
- Tone guard (MAIN) applied: see script.md.

Re-render, from whatif/aitrends-2d-studio (Linux: export CHROMIUM_PATH=/opt/pw-browsers/chromium; pip install numpy scipy):
    node render.mjs --project projects/miss-unsinkable --out projects/miss-unsinkable/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/miss-unsinkable --video projects/miss-unsinkable/build/video_silent.mp4 --out projects/miss-unsinkable/build/video_mixed.mp4
    ffmpeg -i projects/miss-unsinkable/build/video_silent.mp4 -i projects/miss-unsinkable/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart video.mp4
(cloud render: 9m54s for 658 frames with 4 SwiftShader workers)

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256.
