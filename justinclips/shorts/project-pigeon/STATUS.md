STATE: ready

# Project Pigeon — status

- `video.mp4`: 1080×1920, 24 fps, 1088 frames, **45.36 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the
  cloud (Toon 3D, swiftshader, 4 workers, 18m10s).
- Audio: master **-14.1 LUFS** integrated, **true peak -3.4 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:curious`
  -21 dB, 63 SFX cues: kit sounds + original synthesized pecks from make_pecks.py), then the same project master step as octopus/woolpit
  (`alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`), remuxed with -c:v copy.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 49.9 s; tightened by tighten_vo.py at
  atempo 1.04 (pitch kept), pauses capped 0.32 s, 0.2 s gaps, held beats before lines 2/7/8/10/11 → 45.1 s of voice.
- **Whisper QA** (small.en, beam 5) on the final video.mp4 reads the script word for word. Spelling-only differences: "World War II",
  "$25,000", "Majority Rules" (capitals).
- Contact sheet (contact_sheet.png, from the final file via justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI
  zones, the last frame next to frame 1, one frame per shot. Checked: frame 1 is moving (pecking + clouds) with the 2-line caption;
  captions (y 0.72), stamps and chips sit clear of the top bar, right buttons and bottom title area; the last frame = frame 1's camera (loop).
  Fixed after the stills checks: cockpit walls hid the birds (lowered, birds scaled up), over-the-shoulder camera inside the cap (now a
  side view of the screen), officials cut off in the office/demo, Navy officer off-frame, the "Committed" bird not looking at the lens.
- Rules: line 1 = 9 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, PIGEON gold / MISSILES red; the peck sound + picture in
  the first second; "But here's the part..." at 27.2 s; 23 shots + 2 internal hard cuts (avg ~1.9 s); escalations ~3.9 / 12.7 / 17.6 /
  21.9 / 27.2 / 32.9 / 34.7 / 40.4 s; inserts: 10,000 PECKS counter, $25,000 bag, YEARS LATER calendar; payoff "still pecking" 42.0–43.9 s;
  closer "Subscribe for more." ~1.3 s; s23 lands on frame 1's framing → loop. Visual gags: helmeted pilots, the majority stare-down,
  the "Committed" stare, ECCENTRIC/IMPRACTICAL then a shrug and $25,000, the double-take, the feather after CANCELLED, the box that
  bumps the bird aside — each tied to a sourced fact.
- Fact checks / wording changes (see sources.md):
  - "10,000 pecks in 45 minutes" and "eccentric and impractical" are Wikipedia-only → said as "reportedly".
  - The demo "reportedly worked" (Smithsonian: "successful demonstration"; MIT TR notes the test conditions were questioned).
  - "Six years later... still pecking": Smithsonian + army.mil (tests at 1, 2, 4 and 6 years).
  - The brief's "it reportedly worked in tests" and "briefly revived as Project Orcon" are both in; Orcon's 1948/1953 dates are confirmed
    by Wikipedia, army.mil and MIT TR.
- Nothing was posted, uploaded or logged in anywhere. (Paused once on MAIN's instruction mid-render; resumed and re-rendered from scratch.)

Re-render, from whatif/aitrends-2d-studio (P=projects/project-pigeon; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.04                 # -> input/voiceover.wav (45.1 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                             # story/shots.json from the word timings
    ~/.venvs/chatterbox/bin/python $P/make_pecks.py                      # sfx/*.wav (original peck sounds)
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ../../justinclips/shorts/project-pigeon/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
