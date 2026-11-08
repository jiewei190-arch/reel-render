STATE: ready

**Final video (rendered in the cloud, the PC was off):** `video.mp4` (1080x1920, 24 fps, 834 frames, 34.75 s, -14.1 LUFS, true peak -1.5 dBTP, 39.1 MB, one file, no split), checksum in `video.sha256`.
Mixed with `audio/mix.py`, then the mastered audio (+0.7 dB, limiter at 0.82) muxed onto the full silent render with `-c:v copy`; the frame count and duration match the silent render (834 frames / 34.75 s), nothing trimmed. Build frames deleted.
Cloud render: SwiftShader, 4 workers, 0.88 fps (16m03s).

# I.Awaken Short: dancing-plague ("The Year a Whole City Couldn't Stop Dancing 💃")
- Script: `script.md` (12 lines, 34.75 s, Kokoro am_fenrir via `whatif/voice/fenrir.py`, speed 0.95, `--gap 0.3 --comma 0.15 --lead 0.15 --section 0.85`). "1518" is voiced as "fifteen eighteen" (Kokoro read the digits as "one thousand five hundred eighteen"); captions still show "1518".
- Sources: `sources.md` (all claims checked; 400 said as "according to chronicles"; deaths left out, they are disputed).
- Project: `project/` (Toon 3D kit, 18 shots, 9:16 1080x1920, 24 fps). Render from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/dancing-plague/project`.
  Scenes: `_lib.js` (1518 Strasbourg street: half-timbered houses, red-sandstone cathedral spire, bunting; townsfolk, Frau Troffea, physician, councillor, musicians; `jig()` dance; stage, instruments, sign), `crowd.js`, `town.js`, `doctor.js`, `stage.js`, `eerie.js`. No kit files changed.
- Cast cameo: DEV (beanie, phone) filming the crowd and BISCUIT judging from a barrel (s13); BISCUIT also in s01/s18.
- Preview: `preview_dancing-plague.mp4` (540x960, mixed, -14.1 LUFS / -1.5 dBTP). QC: `contact_dancing-plague.png` (frame 1, every shot, last frame; loop = s18's last frame == s01's first frame).
- The preview was rendered just before a small s13 framing fix (DEV moved into frame); the final video has the fix.
- Nothing posted, uploaded or scheduled.
