STATE: ready

# The Toledo War — status

- `video.mp4`: 1080×1920, 24 fps, 1097 frames, **45.71 s** (target 40–48), H.264 + AAC, 20 MB. sha256 in `video.sha256`. Rendered in full in the
  cloud (Toon 3D, SwiftShader, 4 workers, 8m27s). Muxed with `-t` = the video length (no `-shortest` frame loss).
- Audio: **-13.9 LUFS integrated, true peak -2.8 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:curious` -21 dB,
  kit SFX cues on words + the original synthesized staring-contest sting `sfx/stare.wav` from make_sfx.py), then the octopus-nine-brains
  master step: `alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 54.5 s. Line 2 passed QA on seed 11, the rest on seed 7.
  Line 5 was re-taken as "...a deputy, hurt with a penknife" (Whisper kept hearing "jabbed" as "jobbed") and spliced in by splice_vo.py.
  Line 9's "QA FAIL" is only digits vs words ("1840s" vs "eighteen-forties"); Whisper heard it word for word.
  Tightened by tighten_vo.py at atempo 1.08 (pitch kept): pauses capped 0.28 s (0.5 s kept for the "..." beats in lines 5 and 10, 0.4 s in line 1),
  0.16 s gaps, held beats before lines 5/9/10/11 → 45.4 s of voice + 0.5 s tail.
- **Whisper QA** (small.en, beam 5) on the final video.mp4 reads the script except: "Maumee" → "Malmi" (proper noun), "war's" → "war is",
  "penknife" → "pen knife" (spelling), and "Michigan lost Toledo" → "lost to Lido". The voice track alone and the -14 LUFS master WAV both read
  "Michigan lost Toledo"; only the AAC-encoded mux tips Whisper over, so it is borderline, not a mispronunciation (same as the woodpecker's
  "blankers"). I removed an SFX cue that sat on "lost". **Worth one listen at ~40.5 s before upload.**
- Contact sheet (contact_sheet.png, made from the final file by justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI
  zones, the last frame next to frame 1, and one frame per shot. Checked: frame 1 is moving (zap, sweat, lean, push-in) with the 2-line caption
  centre-top below the top bar; burned captions (y 0.72) and chips sit clear of the right buttons and the bottom title area; the last frame is
  frame 1's camera + pose (loop). Fixed after the preview sheet: frame 1 too tight (governors cropped), s10 camera inside the hat, s19 rock too big,
  chips under the captions. Known small things left: s10 "BUT..." stamp overlaps the top hat; s12's "2" card sits low.
- Rules: line 1 = 10 words, WTF first; top caption 0–3.5 s, "Ohio vs Michigan / nearly WAR over TOLEDO" (WAR red, TOLEDO gold);
  escalations at ~3.6 (bad map) / 7.5 (militias) / 11.9 (shots) / 16.1 ("But here's the part...") / 20.5 (Two Stickney) / 24.5 (Congress) /
  30.8 (worthless) / 33.6 ("But in the 1840s...") / 41.7 (jackpot); 23 shots + 1 internal hard cut (avg ~1.9 s); reaction FX after the reveals;
  3 insert cards (scoreboard 1/0, scoreboard + INJURIES 1, 90% counter); payoff "and won the jackpot" 41.8–43.7 s; closer "Subscribe for more."
  0.94 s; s23 lands on frame 1's framing → loop. Digits in captions, spoken as words.
- Shot times: s01 0.00–2.58 · s02 2.58–3.58 · s03 3.58–4.46 · s04 4.46–7.46 · s05 7.46–9.16 · s06 9.16–10.00 · s07 10.00–11.88 · s08 11.88–14.92 ·
  s09 14.92–16.14 · s10 16.14–17.62 · s11 17.62–20.48 · s12 20.48–22.40 · s13 22.40–24.46 · s14 24.46–25.80 · s15 25.80–27.16 · s16 27.16–29.46 ·
  s17 29.46–30.78 · s18 30.78–33.60 · s19 33.60–36.34 · s20 36.34–40.22 · s21 40.22–41.74 · s22 41.74–44.18 · s23 44.18–45.68
- Paused once by MAIN before the full render (commit bbe9efa), resumed on MAIN's "resume".
- Nothing was posted, uploaded or logged in anywhere.

## Wording changes vs the brief
- The brief's "reportedly the only casualty was a deputy hurt with a penknife": Wikipedia states it as fact ("The only blood spilled was the
  non-fatal stabbing of a law enforcement officer"), so line 5 says it plainly, keeps "hurt" (one light line) and shows only a scoreboard row
  plus a closed-penknife icon ("NOT SERIOUS").
- Added the One/Two Stickney names. Wikipedia names Two Stickney; "One" comes from Toledo's Attic and WorldAtlas only → "Reportedly named One".
- "Shots fired into the air" is said with "Reportedly": the two sides' accounts of the one skirmish disagree (Wikipedia).
- The "consolation prize" (the brief's phrase) is backed by Wikipedia's "considered a poor deal for Michigan" and "a worthless wilderness".
- 90% of US copper by the 1860s is Wikipedia's figure (Upper Peninsula article); Michigan Tech backs Michigan as the top US copper source 1847–1887.
- Left out: Stevens T. Mason's age ("Boy Governor", 24), cut for length; the Michigan governor is just drawn younger.

## Rebuild (from whatif/aitrends-2d-studio; P=projects/toledo-war; Python tools in ~/.venvs/chatterbox from whatif/voice/setup_chatterbox.sh)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    #   (voice_script.md already has the line-5 fix; the shipped raw take = original take + fix5.wav spliced by splice_vo.py 5 fix5.wav)
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.08                     # -> input/voiceover.wav (45.4 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py && ~/.venvs/chatterbox/bin/python $P/make_sfx.py
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t 45.708333 ../../justinclips/shorts/toledo-war/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
