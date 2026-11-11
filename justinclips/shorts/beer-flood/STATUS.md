STATE: ready

# Justin clips Short #23: beer-flood ("A Wave of Beer Flooded London 🍺") — TONE GUARD
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **1040 frames, 43.33 s**, H.264 + AAC, **-14.5 LUFS, true peak -1.2 dBFS**, 29.7 MB (no split needed).
  `video.sha256`: `2aa3e82f6e3de1502732b8af7bb407d73a47ee8e7b19df750c215463eaab39b2  video.mp4`. Full silent render + mix.py audio (no frames trimmed).
- **Rendered in the cloud** (owner's PC unreachable): SwiftShader, 4 workers, 18m46s at 1080x1920.
- **Tone guard (TOPICS.md):** "Eight people died." said once, plainly, over eight candles (dip transitions, no sfx hits, no reaction FX). The flood runs through
  empty rooms and streets; nobody is shown in the beer or hurt. Humour aims only at the brewery: the hoop slips, the clerk shrugs ("Nobody was too worried."),
  the owner smirks over the excise refund. The "crowds drinking from the gutters" legend is not used.
- **Script / voice:** `script.md` (14 lines, Kokoro am_fenrir 0.95; 0.8 s beats before "Nobody was too worried.", "Eight people died.", "The inquest..."). Whisper heard
  "1814", "October 17", "22 feet" (no "one thousand eight hundred..."); captions show digits.
- **Sources:** `sources.md` (History.com, Historic UK, Wikipedia, all read in full). "Act of God" checked in History.com (and Wikipedia) as the topic bank asked;
  "over a million pints" = the low end of the sourced range; we say "inquest", not "court".
- **Upload package:** `UPLOAD.md`.
- **Preview / checks:** `preview/beer_flood_preview_540x960.mp4` (from the final) + `preview/contact_sheet.png` (20 frames; red boxes = Shorts UI zones). Checked:
  frame 1 = the brewery wall bursting, bricks in the air, the porter wave already rolling (Line 1 at 0.12 s, 8 words); twist "Over a million pints. In one wave." at 3.3 s;
  19 shots (new visual every 1.5-3.5 s); reaction FX on the brewery staff/owner only (!, sweat, ???, sparkle) + shake/flash on the burst; 3 INSERT cards (1,000,000+ counter,
  inquest verdict document, ACCIDENT vs NEGLIGENCE versus); whipBlur / iris / flash / dip transitions; captions 1-3 words at 70 % height, clear of the UI zones;
  payoff (verdict + tax refund) 33.8-39.2 s; closer "Subscribe for more." 0.9 s; the last shot pushes into the slipping hoop, which loops into frame 1's burst.
  Audio: kit music `mystery` ducked under the voice + kit sfx (crash/splash/creak/metal/coins on words and beats).
- **Project:** `whatif/aitrends-2d-studio/projects/beer-flood` (voiceover.wav committed). Re-render from `whatif/aitrends-2d-studio`:
  `node render.mjs --project projects/beer-flood --out projects/beer-flood/build/video_silent.mp4` (1040 frames, 43.3 s; on the PC add `--gl gpu`), then
  `python audio/mix.py --project projects/beer-flood --out projects/beer-flood/out/mixed.mp4` and mux `build/mix.wav` onto the silent video
  (`ffmpeg -i build/video_silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac video.mp4`).
- Nothing was posted, uploaded or logged into.
