STATE: ready

# The Locust Swarm That Went Extinct — status

- `video.mp4`: 1080×1920, 24 fps, 1062 frames, 44.25 s (target 40–48), H.264 + AAC, 30 MB. sha256 in `video.sha256`.
  Rendered in full in the cloud (4 workers, SwiftShader, 11.5 min); s02 (frames 66–107) was then re-rendered after a caption fix and spliced in frame-exact (1062 frames checked).
- Audio: mix.py master **-14.1 LUFS** integrated, true peak **-1.4 dBTP** (ffmpeg ebur128 on the final file). Music bed toon3d:mystery (-19 dB, ducked), 46 kit SFX cues.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py (raw 51.4 s, kept as
  input/voiceover_raw.wav), tightened by projects/rocky-mountain-locust/tighten_vo.py **1.12** (pauses capped at 0.3 s, atempo with pitch kept,
  extra beats before line 6 "But...", line 8 and the payoff line 11). Final VO 43.6 s.
  - Line 9 re-voiced on its own after rewording (every seed said "spread" for "bred"); the new take is appended to the raw wav and the line map points to it.
  - TTS-QA "fail" on line 4 is spelling only (Whisper writes "12.5 trillion" for "twelve and a half trillion").
- **Source check** (Wikipedia "Rocky Mountain locust", read Nov 20): 7 lines changed to match the source; table in script.md. Main ones:
  last specimen **1904, Colorado** (not 1902); "biggest swarm **ever recorded**" (not "in history"); "crops, wood, leather... even the clothes off
  people's backs" (not "down to the dirt"); "One theory" (not "the leading theory"); "probably destroyed the eggs" (dropped "without ever noticing").
- **Whisper check** (small.en on the final video.mp4): reads the script word for word, numbers as digits ("12 trillion", "1875", "198,000",
  "30 years", "1904"). One misread: on the whole file it wrote "around 12 and 1,500,000 insects"; the same 2 s cut out of the final reads
  "around 12.5 trillion insects" (checked 3 ways), so the audio says the right words. Transcript: whatif/.../timeline/whisper_final.txt.
- Contact sheet (`contact_sheet.png`, every 44th frame of the final) checked: no dead frames, no clipping, captions readable. Fixed during
  review: specks drawn over the farmer's face (now masked), card text under the captions (s04, s15), specimen label cut off (s12), settler
  walking on the river and a punch-in camera inside his head (s16), "GONE?" stamp hidden by the caption (s02). The two blurred tiles are mid-whipBlur transitions.
- Batch-5 rules: line 1 = 12 words, WTF up front; frame 1 already moving (sky half black, swarm specks, farmer flinching); top caption
  "bigger than / CALIFORNIA" 0–3.55 s, 2 lines, centre-top, "bigger" gold + "CALIFORNIA" red; 19 shots + 4 in-shot punch-ins (cuts ~1.2–2.5 s);
  "but"-turns at 2.8 s (vanished), ~13 s (bigger than California), ~22 s ("But less than thirty years later"), ~27 s (what wiped them out?),
  ~30 s (farmers?), ~37.5 s (probably), ~40 s (glacier). Payoff = last 2.4 s (frozen in the glacier); the camera then tilts up into the sky
  and the loop cuts to frame 1's sky going black.
- TONE GUARD: "twelve trillion" (line 1, rounded) / "12.5" on screen; the farming cause is said and stamped as "ONE THEORY", "FARMERS?",
  "PROBABLY". Nobody is hurt (locusts eat crops, a fence post, a boot and the farmer's shirt; he stays deadpan).
- Nothing was posted, uploaded or logged in anywhere. No paid voice API used.

Re-render, from whatif/aitrends-2d-studio:
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py projects/rocky-mountain-locust/input/vo_script.md projects/rocky-mountain-locust/input/voiceover_raw.wav projects/rocky-mountain-locust/input/script.txt --gap 0.25 --lead 0.1 --beat 0.45   # (then re-voice/append line 9 as above)
    ~/.venvs/chatterbox/bin/python projects/rocky-mountain-locust/tighten_vo.py 1.12
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/rocky-mountain-locust --script projects/rocky-mountain-locust/input/script.txt --lang en --model small
    (cd projects/rocky-mountain-locust && python3 make_shots.py)          # story/shots.json from the word timings
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/rocky-mountain-locust --workers 4 --out projects/rocky-mountain-locust/build/video_silent.mp4
    python3 audio/mix.py --project projects/rocky-mountain-locust --video projects/rocky-mountain-locust/build/video_silent.mp4   # -> out/The_Locust_Swarm_That_Went_Extinct.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
