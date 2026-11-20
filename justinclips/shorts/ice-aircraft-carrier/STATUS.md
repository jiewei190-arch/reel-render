STATE: ready

# The Ice Aircraft Carrier (Project Habakkuk) — status

- `video.mp4`: 1080×1920, 24 fps, 42.62 s, H.264 + AAC, ~20 MB. sha256 in `video.sha256`. Rendered in full in the cloud (12m39s, swiftshader).
- Audio: mix.py master -14.2 LUFS integrated, true peak -1.1 dBTP (ffmpeg ebur128 on the final file). Music toon3d:curious (-19 dB, ducked), 38 kit SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py from `tts_script.md` (raw take 49.6 s).
  Two parts were re-taken and spliced in (kept in input/voiceover_raw.lines.json, "note"):
  - line 4: the default take said "Pykrete" wrongly ("Pajcraté"). Re-rendered with the TTS-only spelling "Pie-kreet" (seed 11;
    Whisper hears "Piecrete"). The script, captions and on-screen text keep "Pykrete".
  - line 7, 2nd part: the default take said "ricochet". Re-rendered "and ricocheted around the room." (seed 42; Whisper: exact).
  Then tightened by projects/ice-aircraft-carrier/tighten_vo.py 1.08 (pauses capped at 0.3 s, atempo 1.08 with pitch kept,
  +0.25 s beat before line 6 "But here's the part...", +0.2 s before the payoff line 11) -> 42.27 s VO.
  Remaining TTS-QA "fails" (lines 2, 3, 5) are spelling only: Whisper writes "World War II", "Jeffrey Pike's", "Codename"/"meters".
- QA: Whisper small.en on the final video.mp4 reads the script word for word apart from spellings ("World War II", "Jeffrey Pike's",
  "not plane ice", "Pikerete", "Codename", "meters"). "1943", "600", "one-horsepower", "reportedly" read correctly.
- Contact sheet (`contact_sheet.png`, a frame every 1.75 s from the final file) checked: no dead frames, no clipped captions/stamps.
  Fixed during review: a full-frame white veil in s04 (ease.outBack(0) > 0 float bug), sailors' "???" covering the top caption,
  Pyke/motor/conference framing too tight for 9:16, the price tag covering the clerk, a mostly-black iris frame into s10 (now whipBlur).
- Facts: every spoken fact checked against Wikipedia "Project Habakkuk" (see sources.md).
  Wording changes from the card: the card's long first line was shortened to 12 words ("Britain planned to fight U-boats with an
  aircraft carrier made of ice."); "would have been the largest ship ever" kept as "would have been the biggest ship ever";
  the card's "to Churchill and Roosevelt's staffs" is said as "at a 1943 conference" (the article: Quebec Conference 1943, per some
  accounts); "reportedly" kept on the pistol story (spoken + a REPORTEDLY stamp); "rising costs" said as "costs ballooned"; the card's
  "killed the project" said as "shelved" with the article's December 1943 date; added the article's three-summers melt as the payoff.
- Rules: hook line 1 = 12 words; top caption 2 lines, centre-top, "MADE OF ICE" gold, on screen 0 → ~3.8 s; "But here's the part..."
  turn at line 6; cuts every ~1.5–2.6 s (a hard camera cut inside every shot); payoff in the last ~2 s ("three summers to melt",
  SUMMER 1-2-3 + MELTED) and the melting ice on blue water loops into frame 1's ice ship on blue water. No hashtags/tags in UPLOAD.md.
- TONE GUARD: nobody hurt (cartoon tracer, PING!); no flags, insignia or logos; generic bean characters, no likenesses.
- Nothing was posted, uploaded or logged in anywhere.

Re-build, from whatif/aitrends-2d-studio (Chatterbox venv from whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python projects/ice-aircraft-carrier/tighten_vo.py 1.08        # input/voiceover_raw.wav -> input/voiceover.wav
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/ice-aircraft-carrier --script projects/ice-aircraft-carrier/input/script.txt --lang en --model small
    python3 projects/ice-aircraft-carrier/make_shots.py                                      # story/shots.json from the VO line times
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/ice-aircraft-carrier --out projects/ice-aircraft-carrier/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project projects/ice-aircraft-carrier --video projects/ice-aircraft-carrier/build/video_silent.mp4   # -> out/The_Ice_Aircraft_Carrier.mp4

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256 (+ tts_script.md, the TTS input).
