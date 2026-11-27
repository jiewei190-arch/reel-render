STATE: ready

# The Wood Frog Freezes Solid Every Winter — status

- `video.mp4`: 1080×1920, 24 fps, 1013 frames, **42.18 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud (Toon 3D, 4 workers, 8m46s).
- Audio: master **-14.1 LUFS** integrated, **true peak -3.2 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:curious` -21 dB, 55 kit SFX cues on words),
  then the green-children-woolpit master step: `alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py; raw take 43.78 s, every line passed Whisper QA on seed 7 (no retakes).
  Tightened by tighten_vo.py: atempo 1.0, pauses capped 0.32 s, 0.2 s gaps, held beats before lines 3/5/7/9/11 → 41.78 s of voice + 0.5 s tail.
- QA: Whisper small.en on the final video.mp4 reads the script word for word ("two-thirds" spelling only).
  Timing note: Whisper's VAD dropped the closer "Subscribe for more." when aligning, so make_shots.py re-times those 3 words from input/voiceover.lines.json (the TTS's own line times).
- Contact sheet (contact_sheet.png, from the final file via justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI zones in red, the last frame
  next to frame 1, one frame per shot. Checked: frame 1 is moving (snow, frost creeping, shiver) with the 2-line caption; captions (y 0.72) and the top caption stay out of
  the top bar, right buttons and bottom title area; the last frame = frame 1's camera, frost level, pose and snowfall (loop).
  Fixed after looking: the frog was framed far too tight for 9:16 (scaled to 0.72 + cameras pulled back), mouth sank into the head (rebuilt as a wrap-around smile),
  s04's second "north" cue resolved to the first one (word-lookup step fixed), s11 card label hit the caption, frame 1 frog too grey with eyes shut.
- Rules: line 1 = 10 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, FREEZES gold / HEART red; "But" turns at 8.7 / 16.0 / 23.9 s + "Then spring" 32.6 s;
  19 shots + 3 internal hard cuts (avg ~1.9 s); reaction FX after reveals; 3 insert cards (vitals monitor, cell diagram, 218 DAYS counter); payoff
  "...like winter never happened." ~38.8–40.0 s; closer "Subscribe for more." 1.23 s; s19 lands on frame 1 → loop. "218" spoken as words, shown as digits.
- Fact checks / wording changes (see sources.md):
  - "Freezes solid" is the popular phrasing (Audubon, NWF); the measured amount is line 3, "up to two thirds" of its body water (Wikipedia 65–70 %; Audubon "up to 60 percent").
  - "No brain activity" was dropped from line 4 (only Wikipedia says it); "No blood flow" is in Wikipedia and ADW.
  - 218 days is the UAF field maximum near Fairbanks (Wikipedia: 193 ± 11 days in natural hibernation); the card adds "about 7 months" (Audubon: "as long as seven months").
  - No survival temperature is spoken: only UAF gives one (-18 °C), so it stayed out.
  - Brief's "heart stops, glucose antifreeze, Alaska" are all in (lines 1/4, 5/6, 7).
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/wood-frog-freezes; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.0            # input/voiceover_raw.wav -> input/voiceover.wav (41.78 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                        # story/shots.json from the word timings (re-times the closer if Whisper drops it)
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ../../justinclips/shorts/wood-frog-freezes/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256.
