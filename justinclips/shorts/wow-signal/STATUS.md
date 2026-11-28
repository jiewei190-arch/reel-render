STATE: ready

# The Wow! Signal — status

- `video.mp4`: 1080×1920, 24 fps, **1093 frames, 45.54 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`.
  Rendered in full in the cloud (Toon 3D, SwiftShader, 4 workers, ~12 min). Then 16.5–21.0 s (frames 396–503: s11–s12) was re-rendered after moving
  two chips that touched the bottom caption up to y 1225, spliced in by frame number and re-encoded once (libx264 CRF 16); seams checked at 16.5 and 21.0 s.
- Audio: **-14.1 LUFS integrated, true peak -3.2 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:mystery` -20 dB, 70 kit SFX cues
  on words) + the project master step used by octopus-nine-brains: `alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`, muxed with `apad` so all 1093 frames are kept.
  All SFX come from the kit's procedurally generated library; no real recordings.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), numbers spelled out in input/voice_script.md. Raw take QA: lines 4 and 6 flagged for spelling only
  (Whisper writes "6EQUJ5" as one token and "Ehman" as "Eman"/"Eamon"); line 10 re-taken as "...with over ten thousand tweets" (seed 7, QA ok) and
  spliced in by splice_line.py. Tightened by tighten_vo.py 1.08 (pauses ≤ 0.3 s, held "..." beats kept at 0.5 s) → 45.3 s of voice + tail.
- **Whisper QA on the final video.mp4** (small.en, beam 5): reads the script word for word — "In 1977, a telescope caught a signal so weird someone
  wrote, wow ... it printed 6EQUJ5 ... Jerry Eman circled it ... With over 10,000 tweets, subscribe for more." (spelling-only differences: 6EQUJ5, Eman).
- Contact sheet (`contact_sheet.png`, from the final file, justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI zones,
  the last frame next to frame 1, then one frame per shot. Checked: frame 1 is moving (printer chattering, the red circle already drawing round 6EQUJ5)
  with the 2-line top caption clear of the top bar; captions (y 0.72) clear of the bottom title area and the right buttons; last frame = frame 1's camera,
  sheet and pen position → loop. Fixed after the first still sheet: Big Ear field too dark and the ear off-frame (s04), desk shots seen from behind
  (s12, s16), the decades card over the face (s16), comets cropped and the arrows off-screen (s18), the radio dish sunk under the ground (s24-s25),
  cameras too close (s02, s23). Known nit left in: the "cupping his ear" pose in s05 reads as a hand on the chest; the LISTENING FOR ALIENS chip carries the beat.
- Brief rules: line 1 = 12 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, SIGNAL gold / "WOW!" red; frame 1 already moving; escalations at
  ~5 / 12 / 18 / 21 / 27 / 33 / 37 / 42 s; 28 shots (avg 1.6 s); reaction FX after reveals ("!", sweat, stars, flash, ???); 3 insert cards
  (6EQUJ5 bar chart, 72 s counter, 10,000+ TWEETS); "But here's the part..." at 32.6 s; payoff "...with over 10,000 tweets." 42.1–44.1 s;
  closer "Subscribe for more." 1.4 s; s26 lands on frame 1 → loop. Digits on screen, words in the TTS. 9 visual gags, each tied to a fact (script.md).
- Fact changes vs the brief (see sources.md): "over 10,000 tweets" (Wikipedia "approximately", Space.com "more than 10,000"); no "red ink" claim in the
  narration (unsourced; the circle is drawn red as on the famous scan); the 2024 cloud idea and the comets are shown as possibilities
  ("a hypothesis", "MAYBE?", "UNCONFIRMED", "NOPE"); the golf-course aftermath was left out (sources disagree on the demolition year: 1997 vs 1998).
- No real logos (generic dish, plain speech bubbles for tweets), no real likeness (generic toon astronomer), no channel name in the video.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/wow-signal; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/splice_line.py 10 $P/input/l10.wav     # the "over 10,000 tweets" re-take
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.08                     # -> input/voiceover.wav (45.3 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                                 # story/shots.json from the word timings
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    # (one render now includes the chip fix, so the frame splice is not needed)
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -af apad -c:a aac -b:a 192k -t 45.542 ../../justinclips/shorts/wow-signal/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
