STATE: ready

# The Great Sheep Panic of 1888 — status

- `video.mp4`: 1080×1920, 24 fps, 991 frames, 41.4 s, H.264 + AAC, 19.6 MB. sha256 in `video.sha256`. Rendered in full in the cloud
  (SwiftShader, 4 workers, 15 m 19 s).
- Audio: mix.py master **-14.2 LUFS** integrated, true peak **-1.4 dBTP** (ffmpeg ebur128 on the final file). Music bed `toon3d:mystery`
  at -18 dB, 50 SFX cues.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.25 --lead 0.1 --beat 0.45`
  (raw take 42.9 s, kept as `input/voiceover_raw.wav`), tightened by `projects/sheep-panic-1888/tighten_vo.py 1.0` (pauses capped at
  0.3 s, 0.2 s line gaps, +0.25/0.3/0.3 s beats before lines 5, 8 and 10) → 40.9 s. No speed-up was needed to reach the 40–48 s target.
  TTS-QA "fail" on line 2 is spelling only (Whisper wrote "3rd", "8"); the audio says "third", "eight".
- QA: Whisper small.en on the final file reads the script word for word. The only differences are the digits it writes
  ("3rd" for "third", "200" for "two hundred").
- Contact sheet (`contact_sheet.png`, every 1.5 s of the final file): checked. No dead frames: the near-black tile at 16.5 s is the
  0.45 s iris from night to "next morning" (3 frames at near-black), and the grey tile at 7.5 s is the 0.18 s flash cut into the map.
  Fixed during preview: frame 1 was too wide (tiny sheep), and the s03/s08/s10/s17 close-ups were cropped. The map (s04) and the
  newspaper (s11) overlapped the captions, the BERKSHIRE sign was cut off, and a fence rail crossed the s18 close-up.

## Source check (Wikipedia "Great Sheep Panic", read before voicing): lines changed to match the article
| # | script.md | voiced (matches the source) | article wording |
|---|---|---|---|
| 6 | "farmers found them crammed into corners and under hedges, still panting with terror." | "sheep were found crowded into corners of fields, some panting with terror under hedges." | "Sheep were found crowded into corners of fields, and some were panting with terror under hedges." (no "farmers", "crowded" not "crammed", "some" not all) |
| 7 | "…released all those sheep." | "…released all these sheep." | The Times, 20 Nov 1888: "…could not have frightened and released all these sheep." |
| 9 | "It was a very dark night, with flashes of lightning. And sheep scare easily." | "An intensely dark night, with occasional flashes of lightning. And sheep are notoriously timid." | Nature, 1921: "an intensely dark night, with occasional flashes of lightning"; "sheep are notoriously timid and nervous animals" |
Lines 1–5, 8, 10 match the article as written (3 Nov 1888, ~8 pm, tens of thousands, ~200 sq mi of Oxfordshire, "simultaneous
impulse", miles away next morning, 1889 repeat in Berkshire; the article files it under unexplained phenomena).

## Brief rules (batch 5)
- Length 41.4 s (target 40–48). Hook line 1 = 12 words. Frame 1 is already moving: a night stampede charging the lens, dozens of
  glowing eyes, the fence going down. Top caption "no one knows / why" ("no one" gold, "why" red), 2 lines centre-top, 0–3.6 s.
- A "but…" escalation about every 7 s: 0 hook · 8 "flocks panicked at the same moment" · 15 "But here's the strange part…" ·
  22.6 The Times · 27 "And a year later…" · 30.8 the explanation · 37.8 "nobody knows". Cuts every ~1.3–2.5 s (18 shots, plus
  punch-ins inside s01, s09 and s18).
- Payoff in the last ~2.5 s; s18 ends in frame 1's exact framing and run phase (the frozen flock bolts) → cuts straight back to frame 1.
- TONE GUARD: the cause stays unconfirmed. Nature is stamped "ONE EXPLANATION", the payoff is stamped "UNSOLVED", and nothing is shown
  in the dark (no creature, ghost or light other than the moon). Lightning appears only in s16 (the explanation). Sheep are scared,
  never hurt.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio:
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/sheep-panic-1888 --workers 4 --out projects/sheep-panic-1888/build/video_silent.mp4
    python3 audio/mix.py --project projects/sheep-panic-1888 --video projects/sheep-panic-1888/build/video_silent.mp4   # -> out/The_Great_Sheep_Panic.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
