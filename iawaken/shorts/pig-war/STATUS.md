STATE: animating

- **Re-voice in progress (owner fix):** the year is now spoken "eighteen fifty-nine" (was read as "one thousand eight hundred fifty-nine"). New VO is 0.94 s shorter; shots from s05 on are shifted to match. video.mp4 below is the OLD cut until the re-render is pushed.
# I.Awaken Short: pig-war ("Two Empires Almost Went to War Over a Pig 🐖")
- `video.mp4`: 1080x1920, 24 fps, 926 frames, 38.58 s, -14.4 LUFS integrated, true peak -1.2 dBFS (ffmpeg ebur128). 19.2 MB, single file (no split needed). Verify: `sha256sum -c video.sha256`.
  mix.py's own mux came out at 923 frames, so the mix (`build/mix.wav`) was muxed onto the full 926-frame silent render with `-c:v copy` (audio AAC 192k).
- `preview.mp4` (540x960 with audio), `contact_sheet.png` (frame 1, each shot's midpoint, last frame). The last shot replays the opening move, so the end loops into frame 1.
- `script.md` (12 lines, Fenrir 0.95), `sources.md` (every spoken line checked against nps.gov; no legend parts spoken), `UPLOAD.md` (title, description, pinned comment, cover frame, post time).
- `project/`: Toon 3D kit project, 20 shots. Re-render from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/pig-war/project` then `python3 audio/mix.py --project ../../iawaken/shorts/pig-war/project`. The pig, bronze statue, warships, flags and island sets are project-local (`project/scenes/_lib.js`); the shared kit was not changed.
- Known nit: in s16 (29-31 s) the emperor's gavel sits in front of his face for part of the swing.
- Nothing posted, uploaded or scheduled.
