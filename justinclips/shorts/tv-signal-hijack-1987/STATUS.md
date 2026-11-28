STATE: ready

# A Masked Stranger Hijacked Chicago TV (1987) — status

- `video.mp4`: 1080×1920, 24 fps, 1110 frames, **46.26 s** (target 40–48), H.264 + AAC, 23 MB. sha256 in `video.sha256`.
  Rendered in full in the cloud (Toon 3D, swiftshader, 4 workers, 12m09s). (A first render was stopped at ~65% by MAIN's pause and discarded.)
- Audio: audio/mix.py master **-14.2 LUFS integrated, true peak -1.3 dBTP** (ffmpeg ebur128 on the final file). Music: kit "mystery" -21 dB, 51 SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 53.4 s; every line read correctly
  (the tool's "QA FAIL" flags on lines 1/3/10 are only "TV", "80s", "FCC" spelling normalisation; line 7 used seed 11).
  Tightened by tighten_vo.py 1.08 (pitch kept): pauses capped 0.32 s, longer held beats inside lines 2/6/7/10 (the "..." punchlines;
  0.6 s silence before "nobody knows who was under the mask"), held beats before lines 7/10/11 → 46.0 s voice + 0.5 s tail.
- SFX: original, synthesized by make_buzz.py (detuned saw buzz + crackle, TV static, channel blip) + kit SFX. No broadcast recordings.
- **Whisper QA** (small.en, beam 5) on the final video.mp4: 124/126 script words match. Misses: "nine" is transcribed as the digit "9"
  (same word), and "The sportscaster" as "This sportscaster" (the article is soft in the take; worth one listen at ~22 s).
- Contact sheet (contact_sheet.png, made from the final file by justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the
  Shorts UI zones, the last frame next to frame 1, one frame per shot. Checked: frame 1 is moving (VHS tears, the man mid-sway, BZZZT)
  with the 2-line top caption centre-top below the top bar; captions (y 0.72) clear of the right buttons and bottom title area;
  the last frame is frame 1's camera + pose (loop). Fixed after a preview sheet: the TV close-ups in s02/s13 were hidden behind the
  viewer's head, the NOV 22, 1987 stamp and TWICE chip overlapped the captions, the s13 chips overlapped (and "11 PM" became
  "LATE-NIGHT", since the sources give 11:15 vs ~11:20), the s16 staff were out of frame, s09 was too tight.
- Rules: line 1 = 9 words, WTF first; top caption 0–3.5 s (MASKED gold, HIJACKED red); the buzz + the swiveling sheet metal from frame 1;
  "But here's the part..." at 26.5 s; escalations ~4.3 / 8.4 / 14.7 / 19.3 / 26.5 / 31.6 / 36.2 / 42.7 s; 21 shots + 3 internal cuts
  (avg ~2 s); reaction FX after reveals (??? / ! / sweat / zzz); 2 insert cards (VERSUS: fancy high-tech vs sheet of metal; ABOUT 90 SEC);
  payoff "nobody knows who was under the mask" 42.7–44.8 s on the mask ("WHO?"); closer "Subscribe for more." 0.9 s; last shot lands on frame 1.
- Visual gags tied to facts: the sheet-metal "background" + VERSUS card; the viewer's popcorn double-take; ear-plugging on "just a loud buzz";
  the engineer slamming a giant FREQUENCY lever; the sportscaster's shrug + ??? on "so am I"; the dozing late-night viewer; the empty tower
  room with a spinning chair and a tumbleweed; the investigator's beat-of-silence shrug.
- Shot times: s01 0.00–1.98 · s02 1.98–4.30 · s03 4.30–6.84 · s04 6.84–8.38 · s05 8.38–10.58 · s06 10.58–12.80 · s07 12.80–14.74 · s08 14.74–17.18 · s09 17.18–19.26 · s10 19.26–21.90 · s11 21.90–26.48 · s12 26.48–28.54 · s13 28.54–31.56 · s14 31.56–33.08 · s15 33.08–36.18 · s16 36.18–37.60 · s17 37.60–39.46 · s18 39.46–41.40 · s19 41.40–42.74 · s20 42.74–44.80 · s21 44.80–46.26
- Nothing was posted, uploaded or logged in anywhere.

## Changes vs the brief / facts
- The real character's name and likeness are not used anywhere on screen or in the VO; the VO says "dressed as an 80s TV character" and
  the intruder is a generic grinning rubber mask + sunglasses. The crude parts of the second broadcast are left out ("bizarre nonsense").
- No length for the first intrusion: Wikipedia gives "nearly 17 seconds" (lead) and "about 30 seconds" (body). The VO only says the
  engineers switched frequencies and he vanished.
- "Two hours later" instead of a clock time (Wikipedia ~11:20 p.m., Damn Interesting 11:15 p.m.).
- Sunglasses: Wikipedia only (the other two sources don't mention them). Everything else is in Wikipedia + at least one more source (sources.md).

Rebuild, from whatif/aitrends-2d-studio (P=projects/tv-signal-hijack-1987; Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.08
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py ; python3 $P/make_buzz.py
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4   # -> out/A_Masked_Stranger_Hijacked_Chicago_TV.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
