STATE: ready

# The Bloop — status

- `video.mp4`: 1080×1920, 24 fps, **1052 frames, 43.83 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`.
  Rendered in full in the cloud (Toon 3D, SwiftShader, 4 workers, ~11 min).
- Audio: **-14.0 LUFS integrated, true peak -2.8 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:mystery` -20 dB, 53 SFX cues on
  words) + the project master step (`alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`; it landed at -14.4 because of the sub-bass sweep, so a measured
  +0.4 dB gain was added), muxed with `apad` so all 1052 frames are kept.
- **SFX are original**: `make_sfx.py` synthesizes the low rising sweep (frame 1 and the "...this." beat), the sped-up "bloop" chirp and the ice crack.
  No recording of the real NOAA sound is used. Other SFX are from the kit's procedurally generated library.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), numbers spelled out, "NOAA" respelled "Noah" for the TTS only. Raw take QA: every line OK except line 9,
  flagged for spelling only (Whisper writes "ice quake" as two words); "bloop" took seed 23. Tightened by tighten_vo.py 1.06 → 43.6 s of voice + tail.
- **Whisper QA on the final video.mp4** (small.en, beam 5): reads the script word for word ("...it went bloop ... In 2005, Noah found the source.
  Not a sea monster, an ice quake ... The monster was ice. Subscribe for more."); differences are spelling only (Noah/NOAA, ice quake/icequake).
- Contact sheet (`contact_sheet.png`, from the final file, justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI zones, the last
  frame next to frame 1, then one frame per shot. Checked: frame 1 is moving (the monster bobbing, rings pulsing, the fish turning) with the 2-line top
  caption clear of the top bar; captions (y 0.72) clear of the bottom area and the right buttons; the last frame is frame 1's camera with the monster back
  in place → loop. Fixed after the first still sheet: the "???" over the top caption (s02), the hydrophone too close (s03), the volcano too dark (s04),
  the whale's face out of frame (s12), and chips moved up to y 1215–1225 so they never touch the bottom caption (s06, s11, s12, s15).
  Known nit: in s21 the falling ice chunk is mostly hidden by the glacier wall; the CRACK!, the splash and the penguins carry the beat.
- Brief rules: line 1 = 10 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, OCEAN gold / NOBODY red; the signature sweep plays from 0.0 s;
  escalations at ~4 / 7 / 12 / 17 / 21 / 26 / 29 / 33 / 37 s; 23 shots (avg 1.9 s, cuts 0.8–2.8 s); reaction FX after reveals (!, sweat, ???, flash, shake);
  2 insert cards (oscilloscope, Pacific map ~3,000 MILES); "But here's the part..." at 29.2 s; payoff "The monster... was ice." 39.5–41.0 s;
  closer "Subscribe for more." 1.5 s; loop. 7 visual gags, each tied to a fact (script.md).
- Fact changes vs the brief (see sources.md):
  - "a sound louder than anything we knew" is not supported by any source → the hook is "a noise nobody could explain", the sound is "extremely loud"
    (NOAA), and the comparison is attributed: "Reportedly, it was far louder than a blue whale, the loudest known animal" (Popular Science / Wolman in Wikipedia).
  - Distance: sources give 3,219 km, 4,800 km/3,000 mi and "over 5,000 km" → "about 3,000 miles apart" (Wikipedia/Wolman, Popular Science, Gizmodo).
  - NOAA's conclusion: "in 2005" (NOAA Ocean Service); Wikipedia says "by 2012" for NOAA's icequake description (noted, not contradicted).
  - Not used: "May 1997", the Lovecraft link, the 50°S 100°W coordinates on screen (the map shows "remote South Pacific").
- No real logos, no real likeness (generic toon scientists), no channel name in the video. Nobody is hurt.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/the-bloop; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.06                     # -> input/voiceover.wav (43.6 s)
    ~/.venvs/chatterbox/bin/python $P/make_sfx.py                            # -> sfx/sweep_3.wav, sweep_5.wav, bloop.wav, icecrack.wav
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                                 # story/shots.json from the word timings
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11,volume=0.4dB" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -af apad -c:a aac -b:a 192k -t 43.833 ../../justinclips/shorts/the-bloop/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
