STATE: ready

# The War of the Stray Dog — status

- `video.mp4`: 1080×1920, 24 fps, 1020 frames, 42.5 s, H.264 + AAC, 21.6 MB. sha256 in `video.sha256`. Rendered in full in the cloud (4 workers, SwiftShader, 11m38s).
- Audio: mix.py master -14.2 LUFS integrated, true peak -1.4 dBTP (ffmpeg ebur128 on the final file). Music toon3d:curious (-19 dB, ducked), 53 SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py (raw take 48.2 s, kept as input/voiceover_raw.wav; QA ok on every line,
  line 7 "Petrich" needed seed 23), tightened by projects/war-of-the-stray-dog/tighten_vo.py 1.06 (pauses capped at 0.3 s, atempo with pitch kept,
  +0.2 s before line 6 "But...", +0.25 s before line 10) → 41.8 s VO + 0.7 s silent tail for the loop.
- QA: Whisper small.en on the final file reads the script word for word ("1925", "48", "2 million", "45,000", "Petrich" all correct; it writes "Ten" as "10").
- Contact sheet (`contact_sheet.png`, 1 frame every 1.7 s from the final file) checked: fixed a soldier filling the frame in s02, a too-small "*there is
  another version" note in s03, clipped sign text (GREEK OUTPOST / PETRICH), signs and a border post blocking the hero shots, and squads off-frame in frame 1.
  The blurred tile at ~34.9 s is the whip transition into s19, not a dead frame.
- Jail rules: line 1 = 11 words, WTF first; top caption "they started a WAR / over a DOG" (WAR red, DOG gold) held 0–3.6 s, centre-top, 2 lines;
  frame 1 already moving (dog mid-trot between two glaring squads); "But here's where it gets wild" at 18 s (line 6); escalations every ~5–7 s;
  21 cuts (avg 2.0 s); payoff "the War of the Stray Dog" in the last ~2 s; the dog trots back to frame 1's start position in frame 1's camera → loop.
- Nothing was posted, uploaded or scheduled anywhere.

## Wording changes vs the card
- Card's first line ("In 1925, a soldier chasing his runaway dog accidentally triggered an international war, at least according to the classic
  account.") split into line 1 (11 words) + line 2 "At least, that's the classic account." — attribution kept.
- Card's "Greek version blames a Bulgarian raid on an outpost" → "The Greek version is different: Bulgarian troops crossed over and attacked a Greek outpost."
  (Wikipedia: "crossed the Greek border, attacked a Greek outpost").
- Card's "Greece invaded the border town of Petrich" → "marched into Bulgaria, toward the town of Petrich" (Wikipedia: the League ordered a ceasefire
  "just hours before the Greek army was due to launch its attack on the town"; it does not say the town was taken). Added the ceasefire timing.
- Added the 48-hour ultimatum (apology, punish those responsible, 2 million French francs) from Wikipedia.
- Added a plain "Dozens of lives lost" (Wikipedia: 50 Bulgarian dead, mostly civilians; Bulgarian estimate of 121 Greek dead) so a LOL Short doesn't hide the cost.
- Card's date "Oct 19–29" kept only as "ten days" (the article body puts the shooting on Oct 18; the infobox gives 19–29 Oct).

Re-render, from whatif/aitrends-2d-studio:
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/war-of-the-stray-dog --out projects/war-of-the-stray-dog/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/war-of-the-stray-dog --video projects/war-of-the-stray-dog/build/video_silent.mp4   # -> out/The_War_of_the_Stray_Dog.mp4 (1020 frames)
Voice (Chatterbox venv): chatterbox_d2.py input/tts_script.md input/voiceover_raw.wav input/script.txt --gap 0.3 --comma 0.15 --lead 0.15; tighten_vo.py 1.06;
    tools/transcribe.py --project projects/war-of-the-stray-dog --script projects/war-of-the-stray-dog/input/script.txt --lang en --model small

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
