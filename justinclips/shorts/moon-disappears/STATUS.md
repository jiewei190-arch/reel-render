STATE: ready

# What if the Moon vanished tonight? — status

- `video.mp4`: 1080x1920, 24 fps, 979 frames, 40.8 s (target 40-48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud
  (render.mjs, 4 workers, SwiftShader, ~5.5 min).
- Audio: master -14.09 LUFS integrated, true peak -1.26 dBTP (measured on the final file). mix.py gave -14.71 / -1.49; `master.py` adds a measured
  +0.71 dB + alimiter (0.85), muxed with -c:v copy. Music `toon3d:mystery` -20 dB (ducked); kit SFX cues per shot.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3), `--gap 0.3 --lead 0.15`. All lines passed Whisper QA word for word
  (seed 7; line 6 seed 11 — seed 7 was heard "Tatis" for "today's"). Line 10's "sixty" is spoken, captioned "60".
  First take came out too short (37.5 s after tightening), so four lines were lengthened by 8 words in total (see below) and re-voiced:
  raw 42.2 s -> `tighten_vo.py 1.0` (pauses capped 0.32 s, 0.18 s gaps, held beats before lines 3/4/5/7/9/10/11) -> 40.27 s + 0.5 s loop hold.
- Whisper QA (small.en) on the FINAL video.mp4 reads the script word for word ("...up to 60 degrees. Subscribe for more."). Caption alignment 127/127 words.
- Contact sheet (`contact_sheet.png`, from the final file): frame 1, hook at 0.4 s and a caption at 15.9 s under a mock Shorts UI, the last frame,
  and one mid-shot frame per shot (23 shots). Checked: frame 1 already moving (the Moon mid-POOF, the kid gasping) with the 2-line caption; captions
  (y = 0.72) clear of the bottom block and right rail; last frame = frame 1's camera with the Moon back up -> loops. Known: in s17 the
  "no big moon" chip sits just under the caption (both readable).
- Fixed after looking: stars drawn over the scene (moved to a 3D star dome / background); beach too dark and the kid tiny in frame 1;
  beetle shots far too close; Earth cut off in the tide shots; scientist and lantern framing; OLD HIGH TIDE chip off-screen.
- Rules: line 1 = 12 words, WTF first; top caption 0-3.5 s, 2 lines, centre-top, MOON gold / VANISHED red; cuts every 1.0-2.2 s (23 shots,
  internal hard cuts s01b, s14b, s16b, s18b); "But"/turns at 3.4 s (Relax), 11.7 s, 16.9 s, 21.8 s, 28.7 s, 34.2 s (Mars); reaction FX after
  each reveal; 3 insert cards (MOON 1 vs SUN < 1/2, ~1/3, 60°); payoff = the 60° Mars card + "thanks, Moon" reaction in the last ~3 s
  before the closer; "Subscribe for more." 1.24 s; loops into frame 1.
- What-if handling: line 2 says it's a thought experiment; tides follow NASA Science (Sun < half the Moon's tide force) and NASA JPL's
  Siegler via Popular Science ("about one third"); tilt follows Laskar & Robutel 1993 + Siegler; every claim cross-checked with Wikipedia (sources.md).
- Changes vs the brief/card: "animals that use moonlight get confused" is carried by one sourced example (dung beetles steer by moonlight
  and can switch to the Milky Way: Wikipedia + Nature 2003); owls/lions/rodents left out (no second source checked). Added to reach 40 s:
  "only", "would happen", "single", "instead", and the tilt timescale "Over a few hundred thousand years" (Siegler, Popular Science).
  Tilt is worded "could wobble" because later work suggests a smaller effect than Laskar's 1993 estimate (noted in sources.md).
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/moon-disappears): same commands as earth-stops-spinning's STATUS.md
(chatterbox_d2.py on $P/input/tts_script.md -> voiceover_raw.wav; tighten_vo.py 1.0; tools/transcribe.py; make_shots.py; render.mjs; master.py; contact_sheet.py ... 0.4 15.9).

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png, video.mp4, video.sha256, STATUS.md.
