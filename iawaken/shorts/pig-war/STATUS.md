STATE: animating

- **Owner fix (Nov 8):** the year is now voiced "eighteen fifty-nine" (Kokoro had read "1859" as "one thousand eight hundred fifty-nine"; checked via its phonemes + whisper word timestamps at 6.1-7.4 s). Same Fenrir settings; everything after the year is sample-identical, so shots s05-s20 moved 0.94 s earlier and captions follow the new word timings. On-screen tag still reads 1859. Nothing else changed.
# I.Awaken Short: pig-war ("Two Empires Almost Went to War Over a Pig 🐖")
- `video.mp4`: 1080x1920, 24 fps, 903 frames, 37.63 s, -14.4 LUFS integrated, true peak -1.2 dBFS (ffmpeg ebur128). 19.0 MB, single file (no split needed). Verify: `sha256sum -c video.sha256`.
  As before, the mix (`build/mix.wav`) was muxed onto the full 903-frame silent render with `-c:v copy` (audio AAC 192k).
- `preview.mp4` (540x960 with audio), `contact_sheet.png` (frame 1, each shot's midpoint, last frame). The last shot replays the opening move, so the end loops into frame 1.
- `script.md` (12 lines, Fenrir 0.95; year spoken "eighteen fifty-nine"), `sources.md` (every spoken line checked against nps.gov; no legend parts spoken), `UPLOAD.md` (title, description, pinned comment, cover frame, post time).
- `project/`: Toon 3D kit project, 20 shots. Re-render from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/pig-war/project` then `python3 audio/mix.py --project ../../iawaken/shorts/pig-war/project`. The pig, bronze statue, warships, flags and island sets are project-local (`project/scenes/_lib.js`); the shared kit was not changed.
- Known nit: in s16 (29-31 s) the emperor's gavel sits in front of his face for part of the swing.
- Nothing posted, uploaded or scheduled.
