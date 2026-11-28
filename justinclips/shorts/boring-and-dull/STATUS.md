STATE: ready

# A Town Called Boring Teamed Up With Dull — status

- `video.mp4`: 1080×1920, 24 fps, 1094 frames, **45.58 s** (target 40–48), H.264 + AAC, 17 MB. sha256 in `video.sha256`.
  Rendered in full in the cloud (Toon 3D, swiftshader, 4 workers, 7m06s).
- Audio: audio/mix.py (music `toon3d:curious` -21 dB, kit + original SFX on words) came out at -14.6 LUFS, so it was re-mastered with the
  project master step (`alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`, as in octopus-nine-brains) and muxed, trimmed to the video length
  with a 0.2 s audio fade: **-14.2 LUFS integrated, true peak -3.0 dBTP** (ffmpeg ebur128 on the final file).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 49.0 s. Line 1 was re-taken (seed 3) and
  spliced in, because every seed of the first run read "Dull" as "Do". Line 10 used seed 11. The other "QA FAIL" flags are spelling only
  (its/it's, a pair/appear, "9th" vs "ninth"). Tightened by tighten_vo.py 1.0: pauses capped 0.32 s, longer held beats inside lines 4/6/10
  (0.6 s before "the Trinity of Tedium"), held beats before lines 6/7/10/11 → 45.5 s voice + tail.
- SFX: original, synthesized by make_sfx.py (two yawns, snore, limp kazoo "ta-da", crickets) + kit SFX. No recordings.
- **Whisper QA** (small.en, beam 5) on the final video.mp4: 108/111 script words match. Misses: "its" → "it's" and "a pair" → "appear"
  (same sounds; the caption shows "a pair").
- Contact sheet (contact_sheet.png, from the final file by justinclips/tools/contact_sheet.py; the last-frame grab used -sseof -0.25 in a
  scratch copy because -0.1 landed past the last frame): frame 1 / 1.5 s / 3.3 s with the Shorts UI zones, last frame next to frame 1, one
  frame per shot. Checked: frame 1 is moving (Boring mid-yawn) with the 2-line top caption centre-top below the top bar; captions (y 0.72)
  clear of the side buttons and bottom area; the last frame is frame 1's camera + faces (loop). Fixed after preview sheets: the cyclist
  floated above the bike and blocked the signs, the motto banner was cropped, the brows covered OREGON/SCOTLAND on the signs, the 2012 stamp
  sat on her face, the calendar appeared late, and the "chirp" text sat on the sign. Known nit: the hall banner is cropped at the frame edges.
- Rules: line 1 = 11 words, WTF first; top caption 0–3.5 s (BORING gold, DULL red); yawn seen + heard from frame 1; "But here's the part..."
  at 24.1 s; escalations ~3.4 / 9.7 / 13.0 / 19.0 / 24.1 / 29.7 / 31.9 / 37.5 s; 20 shots + 3 internal cuts (avg ~2 s); reaction FX
  (zzz, lightbulb, eyes popping open); 2 insert cards (map REAL PLACES; counter ~84 POPULATION OF DULL); payoff "the Trinity of Tedium"
  41.8–44.2 s (all three signs asleep); closer "Subscribe for more." 1.0 s; the last shot lands on frame 1.
- Shot times: s01 0.00–1.06 · s02 1.06–3.44 · s03 3.44–6.36 · s04 6.36–9.74 · s05 9.74–11.52 · s06 11.52–12.96 · s07 12.96–15.70 · s08 15.70–19.04 · s09 19.04–20.56 · s10 20.56–21.60 · s11 21.60–24.06 · s12 24.06–27.18 · s13 27.18–29.72 · s14 29.72–31.94 · s15 31.94–35.00 · s16 35.00–37.50 · s17 37.50–40.96 · s18 40.96–41.84 · s19 41.84–44.24 · s20 44.24–45.74
- Nothing was posted, uploaded or logged in anywhere.

## Changes vs the brief / facts
- Topic swapped in by MAIN (replaces acoustic-kitty, already published Nov 18; acoustic-kitty was never built or pushed).
- "teamed up" / "a pair for the ages": the 2012 link is a "pair" voted by the Boring Community Planning Organization (38 members, unanimous),
  not an official Sister Cities International twinning, so the VO avoids "sister city".
- Bland joined in **2013** (Wikipedia + Anglo&Celtic). The 2017 AP story is a reception in Dull for Bland's mayor, not the join date.
- "League of Extraordinary Communities" (Wikipedia + AP) and "Trinity of Tedium" (Wikipedia + Anglo&Celtic) are both used.
- Not used: Boring's population (8,000 / about 10,000 / 8,985 disagree), Dull's name origin (Pictish "water-meadow" vs Gaelic "meadow"),
  the barbershop quartet (Wikipedia only), the proposer's name (AP doesn't name her). The "ceremony" and party are comic stagings of the
  pairing and the annual day, not claims of a specific event.

Rebuild, from whatif/aitrends-2d-studio (P=projects/boring-and-dull; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
      (then re-take line 1 with --seeds 3 and splice it in; the committed voiceover_raw.wav already has it)
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.0
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py ; python3 $P/make_sfx.py
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -af "afade=t=out:st=45.38:d=0.2" -c:a aac -b:a 192k -t 45.583 ../../justinclips/shorts/boring-and-dull/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
