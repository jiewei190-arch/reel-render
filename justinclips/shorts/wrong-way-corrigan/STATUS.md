STATE: ready

# Wrong Way Corrigan — status

- `video.mp4`: 1080×1920, 24 fps, 985 frames, **41.07 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the
  cloud (Toon 3D, swiftshader, 4 workers, 10m47s).
- Audio: master **-14.0 LUFS** integrated, **true peak -3.2 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:curious`
  -21 dB, kit SFX only: engine, stamp, boing, horn, crowd, tick…), then the project master step (`alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 42.4 s; every line passed QA except line 3
  (spelling only: Whisper writes "Curtis"). Tightened by tighten_vo.py at atempo **1.0** (1.04 gave 38.0 s, under the 40 s minimum),
  pauses capped 0.32 s, 0.24 s gaps, held beats before lines 2/4/6/7/8/9/10/11 → 40.6 s of voice + 0.75 s end hold.
- **Whisper QA** (small.en, beam 5) on the final video.mp4: the script word for word except "flight plan" heard as **"flight plane"**
  (the voice-only QA take heard "flight plan"; Whisper is borderline on it in the mix — same kind of case as "Blankers" in the woodpecker
  Short). The caption shows "flight plan" and the FLIGHT PLAN card shows it on screen. **Worth one listen at ~18 s before upload.**
  Spelling-only differences: "Curtis", "Twenty-eight", "ticker tape".
- Contact sheet (contact_sheet.png, from the final file via justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI
  zones, the last frame next to frame 1, one frame per shot. Checked: frame 1 is moving (plane rolling, pilot waving, compass spinning)
  with the 2-line caption; captions and chips clear of the top bar, right buttons and bottom title area; last frame = frame 1's framing (loop).
  Fixed after the stills checks: the pilot was hidden inside the cabin / under the high wing (now leans out of the window, cameras below
  the wing line), cap over his face, hand blocking the face, strut across the window, RADIO card over his face, x-ray tank invisible,
  officer off-frame, sheep cut aimed outside the portrait frame, s22 plane nose in his face.
- Rules: line 1 = 12 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, IRELAND gold / CALIFORNIA red; "Hi, California!" + the
  spinning compass in the first 2 s; "But here's the part..." at 30.4 s; 23 shots + 1 internal hard cut (avg ~1.8 s); escalations ~4.2 /
  9.1 / 15.3 / 19.2 / 22.7 / 26.5 / 30.4 / 34.9 s; inserts: FLIGHT PLAN document, 28 HOURS LATER counter, licence card; payoff "publicly,
  he never admitted a thing" 36.8–39.3 s; closer "Subscribe for more." ~1.3 s; s23 lands on frame 1's framing → loop.
  Visual gags (each on a sourced fact or a "he said" claim): "Hi, California!" + sheep double-take, officials shaking heads in unison
  (DENIED), the cobweb in the empty RADIO slot, the x-ray fuel tank where the windshield should be, the smug flight plan, the map that
  goes the wrong way, the spinning compass, the liner arriving exactly when the suspension ends, the side-eye smirk.
- Fact checks / wording changes (see sources.md):
  - Kept "said"/"claimed" framing: line 1 "said he was heading for California", line 8 "He said...", line 10 "publicly, he never admitted".
  - "Extra fuel tanks blocked his view" is Wikipedia-only in detail → "reportedly".
  - The brief's "landed in Dublin about 28 hours later" → "28 hours later, he landed in Dublin, Ireland" (Wikipedia 28 h 13 min; HistoryNet 28 h).
  - Added (sourced) the punchline that his licence suspension ended the day his ship got home (Wikipedia + HistoryNet: August 4).
  - "Never publicly admitted" follows Wikipedia; HistoryNet mentions unconfirmed late-1980s reports of an admission, so the video does
    not say he never admitted it at all.
- Nothing was posted, uploaded or logged in anywhere. (Paused once on MAIN's instruction during scripting; resumed.)

Re-render, from whatif/aitrends-2d-studio (P=projects/wrong-way-corrigan; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.0                  # -> input/voiceover.wav (40.6 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                             # story/shots.json from the word timings
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ../../justinclips/shorts/wrong-way-corrigan/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
