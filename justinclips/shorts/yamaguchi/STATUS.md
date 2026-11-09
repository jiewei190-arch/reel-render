STATE: render-on-pc

# yamaguchi (Justin clips Short #15): "He Survived Both Atomic Bombs 🕊️"
Project ready for Creator (PC GPU). Branch `justinclips/batch2-d`. Commit: the one that set this file to render-on-pc (`git log -1 -- justinclips/shorts/yamaguchi/STATUS.md`).

## Expected output
- 1080x1920, 24 fps, **1296 frames, 54.00 s** (voice 53.98 s). -14 LUFS, true peak <= -1 dBFS (preview mix: -14.6 LUFS, peak -1.5 dBFS).
- In the preview, mix.py kept all 1296 frames. If the full mux drops any frames, use step 3 (it copies both streams onto the full silent video).

## Commands (run from `whatif/aitrends-2d-studio`; render.mjs resolves --out from this folder)
```
# 1. full render (Creator adds --gl gpu)
node render.mjs --project projects/yamaguchi --gl gpu --out projects/yamaguchi/build/video_silent.mp4
#    check: 1296 frames
# 2. mix (voice + toon3d:mystery music at -19 dB + soft sfx, -14 LUFS, TP -1.5) to an explicit path
python audio/mix.py --project projects/yamaguchi --video projects/yamaguchi/build/video_silent.mp4 --out projects/yamaguchi/out/yamaguchi_mixed.mp4
# 3. final = full silent video + mixed audio, both streams copied
ffmpeg -y -i projects/yamaguchi/build/video_silent.mp4 -i projects/yamaguchi/out/yamaguchi_mixed.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart ../../justinclips/shorts/yamaguchi/video.mp4
# 4. checksum
cd ../../justinclips/shorts/yamaguchi && sha256sum video.mp4 > video.sha256
```

## Checked in the cloud (half-size preview `yamaguchi_preview_540x960.mp4`, `contact_sheet.png`)
- TONE GUARD kept: calm narration, no jokes, no comedy reactions (no ???, !, sweat, shake). Nobody is shown hurt; both bombings appear
  only as a distant white light (y08: rooftops with no people, light beyond the hills; y12: the office window fills with white light,
  then dip to white). "Badly burned" is spoken over a quiet dusk bench shot with no injury shown.
- Frame 1 = the young engineer on the moving train (countryside scrolling); Line 1 "He survived Hiroshima. Then he went home to Nagasaki." (9 words).
  Twist "Three days later, it happened again." at 4.1 s. 19 shots, a new visual every 1.5-4.6 s (the 4.6 s office shot has a slow push-in).
- Calm FX only: god rays + warm tint, sunny sky (street, hillside), dusk sky, soft white light, a glow on the certificate, gold tags
  ("TSUTOMU YAMAGUCHI", "HIROSHIMA · AUGUST 1945", "AUGUST 6, 1945", "NAGASAKI · AUGUST 9"). 3 insert cards: map (home to Nagasaki),
  document (survivor record: Hiroshima not listed), timeline (2009: survivor of both). Transitions: dissolves, cuts, dipWhite after each light.
  Music `toon3d:mystery` at -19 dB; soft sfx (distant rumble + wind, chime, paper).
- Captions 1-3 words at 66 % height, clear of the right-hand buttons and the bottom title zone (red boxes in the contact sheet).
  Digits on screen: "1945", "August 6", "3 km", "August 9", "2009", "93". Whisper check: spoken as "nineteen forty-five", "two thousand nine",
  "ninety-three" (no "one thousand nine hundred..."). Name fix: Kokoro said "Tsu-ruh-moo", so its phonemes were patched to "tsoo-TOH-moo";
  Whisper now hears "Tsutomu".
- Payoff 41.6-52.2 s: recognized in 2009 at 93, "the first, and so far only, person to get that recognition"; closer "Subscribe for more." 1.1 s;
  the last shot returns to the frame-1 train framing (loop).
- Voice: Kokoro am_fenrir 0.95 (`whatif/voice/fenrir.py --gap 0.35 --comma 0.15 --lead 0.15 --section 0.9`, with a phoneme patch for "Tsutomu").
- Sources: `sources.md` (NBC/AP 2009, Wikipedia citing UK papers; "officially recognized" wording per the topic bank note). Upload text: `UPLOAD.md`.
  Nothing was posted or uploaded.
