# I.Awaken long episodes: cloud makes everything, PC reviews + posts

Owner decisions (Nov 5): I.Awaken is made in the cloud (script, voice, animation). Update the same day: the FINAL RENDER runs on the PC's GPU
through the "Creator" session (much faster than cloud CPUs), the same way eps 1-4 were rendered. The AI Village still only joins, verifies, reviews and posts.
Branch per episode: `iawaken/<branch>` in jiewei190-arch/reel-render (this one: `iawaken/next-episode`, slug `stoptime`).
`STATUS.md` at the branch root: its FIRST LINE is always exactly `STATE: <scripting|waiting-voice|animating|ready>`.

## Roles
- **Cloud (reel studio main + up to 4 workers):** topic pick (if not given), sourced script, narration (Kokoro **am_fenrir**, the voice of
  eps 1-5), timing, shot list, all animation (aitrends-2d-studio kit, classic I.Awaken style), music + SFX mix, final render
  (1920x1080, 24 fps, 5-7 min, -14 LUFS, true peak ≤ -1 dB), upload package (the final render is done by Creator on the PC GPU, see step 3). Never posts, uploads, schedules or touches accounts.
- **PC (AI Village):** joins the parts, checks the hash, reviews, captions, posts.

## The loop (one episode)
| Step | Who | What | STATE |
|---|---|---|---|
| 1 | cloud | script.md + sources.md in `whatif/what-if-<slug>/` | scripting |
| 2 | cloud | Fenrir narration, word timings, shot list, Stage A sets, Stage B batches (4 workers), integrate + QC | animating |
| 3 | Creator (PC GPU, on the lead's signal) | `node render.mjs --project projects/<slug>` + `python3 audio/mix.py ...` (loudnorm to -14 LUFS / TP ≤ -1 dB), then deliver on the branch: `iawaken/out/<slug>/video.part-000`, `video.part-001`, … (each < 95 MB, plain byte split of the MP4), `iawaken/out/<slug>/video.sha256` (SHA-256 of the WHOLE mp4, `sha256sum` format), `iawaken/out/<slug>/UPLOAD.md` (title ≤ 60 chars, description with chapters, tags, pinned comment, settings, captions note incl. "Voice is synthetic.", thumbnail prompt) | ready |
| 4 | PC | join: `cat video.part-* > video.mp4` (Windows: `copy /b video.part-000+video.part-001+... video.mp4`), verify: `sha256sum -c video.sha256` (PowerShell: `Get-FileHash video.mp4 -Algorithm SHA256`), review, post. Optional: add `PC: POSTED <date>` or notes to STATUS.md | — |

`waiting-voice` is no longer used for I.Awaken (kept only as a valid value). Budget: ≤ 4 cloud workers; avoid heavy cloud work across
09:00 US Eastern (the village's daily jobs share the plan's 5-hour limit).
