STATE: ready

# I.Awaken Short: olympic-car ("The Olympic Winner Rode in a Car 🚗", topic bank #3)

**Final video (rendered in the cloud, the PC was off):** `video.mp4` (1080x1920, 24 fps, 768 frames, 32.00 s, -14.4 LUFS, true peak -1.3 dBTP, 21 MB, one file, no split), checksum in `video.sha256`.
Frame count and duration match the silent render (768 frames / 32.00 s); mix.py did not trim anything. Cloud render: SwiftShader, 4 workers, 1.44 fps (8m55s).

- Script: `script.md` (87 words, Line 1 "The Olympic marathon winner rode in a car." = 8 words, twist "Then someone noticed." at 4.5 s, escalations: car breakdown -> strychnine/egg whites/brandy ("1904 sports science") -> rotten apples + nap, "according to legend" -> payoff "slowest in Olympic history, by almost half an hour" -> "Subscribe for more." (1.1 s)). Sources: `sources.md`.
- Voice: Kokoro am_fenrir, speed 0.95, short gaps with longer beats before the punchlines (`project/input/make_vo.py`, same settings as whatif/voice/fenrir.py). Voice is synthetic. Words timed with tools/transcribe.py (95 % match), 4 segments re-timed from the TTS segment marks; caption shows "1904" for the spoken "nineteen-oh-four".
- Project: `project/` (Toon 3D kit, 19 shots, a new visual every 1-2.7 s). Render: from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/olympic-car/project` then `python audio/mix.py --project ../../iawaken/shorts/olympic-car/project`. All period assets (1904 car, dirt road, stadium finish, orchard, runners, handlers) are in `project/scenes/_lib.js`; no kit files changed.
- Cameos: MINA notices (stopwatch), DEV deadpan ("1904 sports science"), BISCUIT on the scoreboard, HERO jaw drop. Loop: the closer shot is the same car pass arriving; the last frame matches frame 1.
- QC: `preview_olympic-car.mp4` (540x960, mixed), `contact_olympic-car.jpg` (frame 1, one frame per shot, last frame). Captions 1-3 words at 68 % height; top tags at 14 %; nothing under the right-side buttons or bottom title area.
- Known nits (left as is): the "z z z" over the nap doesn't render; the egg/brandy props are small in s10; Hicks is partly behind a handler in s18.
- Fact framing: "He crossed the line first" (no source says Lorz was handed the medal); strychnine = legal then, framed as "1904 sports science", Hicks never shown ill.
- UPLOAD.md ready. Nothing posted, uploaded or scheduled.
