# I.Awaken SHORTS: brief for the 4 cloud workers (Nov 8 2026)

Owner's request: Shorts, vertical. **Length (owner rule, Nov 9 2026): YouTube Shorts = whatever the topic needs (don't pad, don't stretch); Instagram Reels 60-70 s** (supersedes the old 20-30 s). Every short is **HOOK -> BUILD-UP -> PAYOFF**.
One short per worker, all four built in parallel. The cloud builds everything up to a render-ready project plus a half-scale preview.
The **final full render is done on the owner's PC GPU** by the Creator session (faster), when the main session tells it to.

## Format rules (from the owner's reference reel, a "10/10 content strategies" video by a marketer)
- Watch time is what makes a short go viral. Every second has to earn the next one.
- **HOOK (0-3 s):** the title question is spoken in the first line (12 words or fewer), and frame 1 already shows the hero
  in the situation and moving. The hook must make the viewer ask a question they need answered.
- **BUILD-UP (about 3-20 s):** raise the stakes in 3-4 quick beats, each one "but then..." / "and it gets worse". No filler, no intro.
- **PAYOFF (last 5-8 s):** the surprising, sourced answer to the hook's question, landing in the last seconds. Then a short closer
  ("Would you do it?" style question or "Follow for more What Ifs.") and a hard cut. No long end card: at most 1 s.
- At least one of the 3 E's: entertainment + education (sourced science) together is the target.
- Total: YouTube = as long as the story needs, no filler; Instagram = 60-70 s including the closer (about 150-170 spoken words at Fenrir's pace).

## Look and voice (the classic I.Awaken look, NOT the horror look)
- Kit: `whatif/aitrends-2d-studio` on branch `iawaken/next-episode`. Read `SETUP_NOTES.md` (Linux: use `python3`, `npm install`;
  Playwright: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, never `playwright install`), `iawaken/HANDOFF.md`.
- Vertical template to copy: `projects/zombie-short` (9:16, 1080p, 24 fps, captions on at y 1330, Shorts safe zones).
  Copy its config.json, cast, sets/acting.js, sets/faces.js, sets/actors.js, and any other sets you need.
  Do NOT use its horror palette: use the bright classic I.Awaken look of `projects/see-in-dark` / `projects/level-up` /
  `projects/stop-time` (style "dusk" or their style), and their QUALITY_BAR.md (hero >= 25 % of frame height, an expression change on a
  spoken word in every shot, blink, idle, moving camera, 2+ parallax layers, atmosphere, rim light, gold numbers, chips <= 6 words).
- HERO = "you" in the mustard hoodie (the I.Awaken lead). Narrator only (no lip-sync).
- Voice: Kokoro **am_fenrir**, `whatif/voice/fenrir.py` (speed 0.95). Kokoro model files go in `/home/user/reel-render/tts/`
  (kokoro-v1.0.onnx + voices-v1.0.bin from the kokoro-onnx GitHub release model-files-v1.0; `pip install kokoro-onnx soundfile`).
  For a short, cut the sentence gaps to about 0.3 s and the section breaks to 0 (patch a local copy of fenrir.py, do not edit the shared one).
- Timing: `tools/transcribe.py` (faster-whisper, >= 90 % match), then `tools/beats.py`, then write `story/shots.json`.
  Shots 1.2-3 s each (about 10-16 shots). Cut on words and on sounds.
- Music + SFX from the kit (`audio/`), loudness -14 LUFS, true peak <= -1 dBFS. `fadeIn: 0` (the hook hits on frame 1).

## Content rules
- Every factual claim is sourced in `sources.md` (NASA, university or journal pages, encyclopedias). Unverifiable numbers are dropped,
  softened or attributed ("scientists estimate..."). List softened claims in STATUS.md.
- Nothing gory, no realistic photos. "Voice is synthetic." goes in the description.
- NEVER post, upload, schedule or log into anything. Build, check, push, stop.

## The four shorts (one per worker)
| Worker | Slug / branch | Title (hook question) | Payoff to land (verify and source it) |
|---|---|---|---|
| W1 | `short-earthhole` -> `iawaken/short-earthhole` | What If You Jumped Into a Hole Through the Earth? | You fall, speed up to the core, slow down and pop out on the other side in about 38-42 minutes, then fall back forever (unless air stops you). Heat and pressure are the build-up. |
| W2 | `short-stopspin` -> `iawaken/short-stopspin` | What If the Earth Stopped Spinning for One Second? | Everything not bolted to the bedrock (you, the air, the oceans) keeps moving east at up to about 1,670 km/h at the equator. |
| W3 | `short-antsize` -> `iawaken/short-antsize` | What If You Shrank to the Size of an Ant? | You could fall from a skyscraper and walk away (tiny terminal velocity), but a single raindrop or water droplet could trap you (surface tension). |
| W4 | `short-blackhole` -> `iawaken/short-blackhole` | What If You Fell Into a Black Hole? | A small black hole stretches you like spaghetti before the horizon. A supermassive one lets you cross the event horizon without noticing anything at all. |

## Deliverables (push to your own branch as each is ready)
Folder `iawaken/shorts/<slug>/` plus the kit project `whatif/aitrends-2d-studio/projects/<slug>/`:
1. `script.md` + `sources.md` (push this FIRST, before animating).
2. The full project (config, input/voiceover.wav, timeline, story/shots.json, scenes) so `node render.mjs --project projects/<slug>` works.
3. `preview_<slug>.mp4`: a half-scale (540x960) full-length cloud render with mixed audio, for the owner to review.
4. `contact_<slug>.png`: one QC sheet (12 frames + the last frame). Check: frame 1 not blank, hook visible from frame 0,
   captions not clipped or overlapping, nothing important in the Shorts UI zones, payoff readable.
5. `UPLOAD.md`: title (<= 60 chars, ends with an emoji), description (hook line + sources + "Voice is synthetic." + 3-5 hashtags
   ending #shorts), pinned comment (a question), thumbnail/cover idea, best post time.
6. `STATUS.md` whose FIRST LINE is exactly `STATE: <scripting|animating|ready-for-gpu-render>`, then duration, shot count,
   softened claims, and the exact GPU render commands (render + `audio/mix.py` + loudnorm) for the Creator session.

Do not do the full-resolution final render in the cloud (the PC GPU does it). Do not edit other workers' files or `iawaken/next-episode`.
