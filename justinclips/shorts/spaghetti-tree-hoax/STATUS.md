STATE: ready

# The Spaghetti-Tree Hoax: status

- `video.mp4`: 1080×1920, 24 fps, 1007 frames, 41.96 s (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud
  (whatif/aitrends-2d-studio, Toon 3D, swiftshader, 4 workers, 13m17s).
- Audio: master **-14.0 LUFS integrated, true peak -2.6 dBTP** (ffmpeg ebur128 on the final file). mix.py's single pass landed at -14.8, so the
  green-children-woolpit master step was used: `alimiter=limit=0.6` → `loudnorm=I=-14:TP=-1.5` (-14.6), then +0.6 dB, then a remux with the audio
  trimmed to the video length. mix.py itself is unchanged. Music: kit "curious" at -21 dB; kit SFX only (`toon3d:*`). No 1957 broadcast audio or footage.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3). Raw take 44.7 s. QA flagged line 2 ("April 1st" heard as "April Honest") and line 9, which is
  only an apostrophe ("Fool's"). Line 2 was re-taken with the TTS text "April first." (spelling only; script and captions keep "1st"), seed 7, now heard as
  "April 1st", and spliced into input/voiceover_raw.wav (44.5 s). Tightened by tighten_vo.py: atempo 1.0, pauses capped at 0.32 s (0.42 s on the "..."
  beats), +0.3 s before "But here's the part", +0.2 s before the April Fools reveal, +0.25 s before the advice, +0.15 s before the closer → 41.7 s of voice.
- **Whisper QA** (small.en, beam 5) on the final mp4: 113/114 words match the script (99.1%). The only miss is spelling: "Fools'" → "Fool's".
- Contact sheet (contact_sheet.png, from the final file): checked frame 1, 1.5 s and 3.3 s against the Shorts UI zones (the top caption sits below
  the top bar, and captions at 72% stay above the bottom title zone), the last frame vs frame 1 (same orchard framing → loop), and one frame per shot. No dead frames.
  Fixed before the final render: cameras inside the sofa family (s02/s09b), a head blocking the TV (s02b), the weevil hidden behind a basket (s08).
  Left in: the "TOMATO SAUCE" print on the 3D tin reads mirrored (the 2D chip spells it out), and the family's reaction FX in s02b sit just off frame.
- Brief rules: line 1 = 11 words, WTF first; frame 1 already moving (noodle being tugged, strands swaying) with the 2-line top caption
  "1957: SPAGHETTI / grows on TREES?" (SPAGHETTI gold, TREES red) held 0–3.5 s; "But here's the part..." at 24.3 s; escalations about every 6–7 s
  (TV jaw-drop 3.3, APRIL 1 5.0, weevil GONE 14.3, TRUSTED 18.5, the turn 24.3, phones 25.7, heart eyes 29.8, APRIL FOOLS 31.8, the tin 35.7);
  cuts every ~1.1–2.7 s (25 shots); reaction FX after the reveals; insert card APRIL 1, 1957 (plus the calendar and RING! chips);
  payoff "...and hope for the best." in the last ~3.3 s, then "Subscribe for more." (1.3 s).
- Facts and changes vs the card: see sources.md. Dropped (Wikipedia only): "8 million viewers", "hundreds" of calls, "mild winter / bumper crop",
  and the CNN quote. The tin-of-tomato-sauce answer is said as "The reported advice", and "a British TV show" is used, with no channel named or shown.
- Shot times: s01 0.00–2.14 · s02 2.14–3.30 · s02b 3.30–5.00 · s03 5.00–6.14 · s04 6.14–7.38 · s04b 7.38–9.26 · s05 9.26–10.56 · s06 10.56–13.24 · s07 13.24–14.30 · s08 14.30–17.26 · s09 17.26–18.48 · s09b 18.48–20.76 · s10 20.76–22.60 · s10b 22.60–24.34 · s11 24.34–25.74 · s12 25.74–27.14 · s12b 27.14–28.56 · s13 28.56–29.80 · s13b 29.80–31.84 · s14 31.84–34.08 · s15 34.08–35.68 · s16 35.68–37.04 · s16b 37.04–38.68 · s17 38.68–40.70 · s18 40.70–41.99
- Nothing was posted, uploaded or logged in anywhere.

## Rebuild (from whatif/aitrends-2d-studio; P=projects/spaghetti-tree-hoax; Python tools in ~/.venvs/chatterbox from whatif/voice/setup_chatterbox.sh)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15
    (line 2 re-take: $P/input/retake/l2.md -> retake/l2.wav, spliced over line 2 of voiceover_raw.wav)
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py                       # -> input/voiceover.wav (41.7 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                             # -> story/shots.json (25 shots, 41.99 s)
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11,volume=0.6dB" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t 41.875 $P/out/final.mp4
