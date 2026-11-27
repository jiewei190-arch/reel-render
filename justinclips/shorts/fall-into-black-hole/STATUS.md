STATE: ready

# What If You Fell Into a Black Hole? — status

- `video.mp4`: 1080×1920, 24 fps, 1010 frames, 42.08 s (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud (4 workers, 14m18s).
- Audio: final file -14.04 LUFS integrated, true peak -4.14 dBTP (ffmpeg loudnorm measure on video.mp4). audio/mix.py landed at -14.44 / TP -1.5 and the
  plain measured-gain pass of build_short.py came out at TP -0.55 after the AAC encode, so `projects/fall-into-black-hole/master.py` adds a limiter
  (limit 0.5, no make-up) before the gain and a -2 dBFS limiter after it. mix.py itself is unchanged. Music: toon3d:curious at -20 dB; 56 kit SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15. Raw take 45.0 s, every part passed
  its Whisper QA (lines 1, 7, 8 on seed 11 after seed 7 misheard "you turn" / "offend" / "He'd ... sing"). Tightened by tighten_vo.py: atempo 1.03 (pitch kept),
  pauses capped at 0.32 s, 0.2 s gaps, held beats before lines 5/7/9 (+0.15 s) and the payoff line 10 (+0.3 s) -> 41.86 s of voice + 0.22 s tail.
- QA: Whisper small.en on the final video.mp4 reads the script word for word ("...about four million times the sun's mass..." "...hits 12.8 seconds later.").
- Contact sheet (contact_sheet.png, from the final file): frame 1, the middle of all 23 shots, 2 frames under a Shorts-UI mock (top bar, right action rail,
  bottom title block), and the last frame. Checked: frame 1 already moving (astronaut tumbling, speedlines) with the 2-line top caption; captions (y 0.72) and
  stamps clear the UI zones; the last frame matches frame 1 (s22 rewinds s01's drift to t=0). The grey s02 tile is the 0.18 s reaction flash on "spaghetti".
  Fixed after the first sheet: astronaut cut off at the top (s01/s02/s05-s08/s21/s22), the friend hidden inside the rocket (s15/s18), binocular POV too tight (s16/s17),
  the POINT OF NO RETURN sign under the captions (s13), SUPERMASSIVE stamp doubling the caption (s09).
- Rules: line 1 = 11 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, WHAT IF gold / BLACK HOLE? red; "But" turns at 3.1, 13.9, 22.9, 31.0 s;
  cuts every ~1.0–2.5 s (internal hard cuts in s17/s19/s21); insert cards s10 (4,000,000) and s20 (12.8 SEC); reaction FX after each reveal;
  payoff "So either way... it's spaghetti. Just later." 37.7–40.2 s, closer "Subscribe for more." 0.9 s; last frame loops into frame 1.
- What-if framing: line 2 + chip "THOUGHT EXPERIMENT"; follows NASA (Schnittman 2024 visualization) and Wikipedia. Numbers spoken as words for the TTS, digits on screen.
- Fact checks (see sources.md): all lines hold. Wording kept careful: "about 4 million" (NASA 4.3 million, Wikipedia ~4 million); the 12.8 s figure is credited
  to "NASA's simulation" because it is specific to that 4.3-million-solar-mass black hole. Nothing had to be changed after checking.
- Tone: cartoon physics; the astronaut stretches like rubber and stays puzzled/smug, never hurt; nobody is shown harmed; no realistic photos, no real logos, no channel name.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/fall-into-black-hole):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/tts_script.md $P/input/voiceover_raw.wav --gap 0.3 --comma 0.15 --lead 0.15   # (already done)
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py           # -> input/voiceover.wav (41.86 s)
    ~/.venvs/chatterbox/bin/python $P/timing.py               # Whisper-aligned words -> story/shots.json (lines.json drives the cuts)
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4 --out $P/out/video_mixpy.mp4
    python3 $P/master.py $P ../../justinclips/shorts/fall-into-black-hole/video.mp4
    ~/.venvs/chatterbox/bin/python $P/contact_sheet.py ../../justinclips/shorts/fall-into-black-hole/video.mp4 $P/story/shots.json ../../justinclips/shorts/fall-into-black-hole/contact_sheet.png 1.0,16.8

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png, video.mp4, video.sha256, tts_script.md.
