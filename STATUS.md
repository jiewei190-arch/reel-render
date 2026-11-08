STATE: ready

# Toon 3D kit + test Short "The Day Rome Got Sacked" (branch iawaken/toon3d, draft PR #11)

## Kit (for every new video, incl. iawaken/ep-rome)
- `whatif/aitrends-2d-studio/kits/toon3d/`: `toon.js` (toon material, inverted-hull outline, stage), `rig.js` (`bean()`, POSE, EXPR, walk/run/point/shrug/idle),
  `cast.js` (I.Awaken cast: HERO, DEV, MINA, DR LIN, TOMAS, BISCUIT the cat, Roman HERO tunic + legionary), `props.js`, `sets.js` (Roman street, Roman house / palace, city wall + gate),
  `fx.js` (toon fire, smoke, embers), `captions.js` (1-3 word captions). Full API: `kits/toon3d/README.md`.
- **Style sheet (owner review):** `kits/toon3d/style_sheet.png`: 6 expressions, outfits + headgear, 3 sets, the cast lineup, 3 expressions each for HERO / DEV / MINA.
- **Channel avatar:** `kits/toon3d/avatar_hero_800.png` (HERO face, centred, 800x800).

## Test Short: `whatif/aitrends-2d-studio/projects/rome-sacked-short/`
- **Owner: look APPROVED (Nov 8). Ending changed per the playbook's "Short closers" rule.**
- 9:16, 1080x1920, 30 fps, **38.85 s**, 15 shots. HOOK (gate, 410, the Roman HERO as the bored guard) -> BUILD-UP (the gate opens "from the inside", silhouettes, 3 days of looting, the 408 pepper ransom) -> PAYOFF (Honorius in Ravenna and his chicken "Roma", "Or so the story goes.") -> closer: "How did the greatest empire on Earth end up here? **Subscribe to find out.**" (spoken, caption, and a gold "SUBSCRIBE TO FIND OUT" end card).
- Narrator: Kokoro **am_fenrir** via `whatif/voice/fenrir.py --gap 0.3 --comma 0.15 --lead 0.15` (shortened gaps; new opt-in flags, defaults unchanged). 102 words. Only the closer was re-voiced (same settings) and spliced into the original take at its sentence gap (36.56 s); all earlier word timings are unchanged. **Voice is synthetic.**
- Facts and softened claims: `projects/rome-sacked-short/sources.md` (Britannica, Procopius, Zosimus, Orosius, Heather). No gore: fire, smoke, silhouettes, sound.
- **Preview (half scale, with mixed audio):** `projects/rome-sacked-short/preview/rome_sacked_preview_540x960.mp4` (new ending; -14.5 LUFS, TP -1.1 dBFS). Contact sheet: `preview/contact_sheet.png`.
- Cloud render speed (SwiftShader, 4 vCPUs, no GPU): 540x960 = 3.4 fps (the Short in ~5m40s). Full res would be ~4x slower, so the full render is for the PC GPU.

## FINAL VIDEO (rendered in the cloud, Nov 8; the owner's PC was off)
- **`iawaken/shorts/rome-sacked-short/video.mp4`**: 1080x1920, 30 fps, 1152 frames, 38.40 s (audio 38.39 s), H.264 + AAC, **-14.6 LUFS, true peak -1.3 dBFS**, 26.6 MB (no split needed).
- `video.sha256`: `e930a750c3ee611c00bebe1137dd90dc72c5f618155cb51c6154030569585a48  video.mp4` (Git Bash: `sha256sum -c video.sha256`; PowerShell: `Get-FileHash video.mp4 -Algorithm SHA256`).
- How: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/rome-sacked-short --workers 4` (SwiftShader, 16m12s, ~1.2 fps) -> `python3 audio/mix.py --project projects/rome-sacked-short`.
  mix.py trims the last frame(s), so the final file is the full 1166-frame silent render with the mixed audio stream copied in (`ffmpeg -i build/video_silent.mp4 -i out/The_Day_Rome_Got_Sacked.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`).
- **Year fix (owner, Nov 8):** the voice now says "August twenty-fourth, four-ten" (Kokoro had read "410" as "four hundred ten"; checked with Kokoro's phonemes and Whisper). Only line 1 was re-voiced (same fenrir settings) and spliced; everything after it moved by -0.465 s. Captions keep the digits ("August 24th," / "410."). The half-scale preview in `projects/rome-sacked-short/preview/` is from before this fix.
- Description must include "Voice is synthetic." Sources: `whatif/aitrends-2d-studio/projects/rome-sacked-short/sources.md`. Closer: "Subscribe to find out." (playbook "Short closers").

## Re-render on the owner's PC (GPU), only if a change is needed, from `reel-render\whatif\aitrends-2d-studio` (Git Bash or PowerShell with the kit PATH, see SETUP_NOTES.md)
```
git fetch origin iawaken/toon3d && git checkout iawaken/toon3d && git pull
cd whatif/aitrends-2d-studio
npm install                                                     # only if node_modules is missing
node render.mjs --project projects/rome-sacked-short --sheet --scale 0.5          # optional 10 s sanity check -> build/sheets/sheet_01.png
node render.mjs --project projects/rome-sacked-short --gl gpu --workers 6         # -> projects/rome-sacked-short/build/video_silent.mp4 (1080x1920, 30 fps, 1166 frames)
python audio/mix.py --project projects/rome-sacked-short                          # music + SFX + voice at -14 LUFS -> projects/rome-sacked-short/out/The Day Rome Got Sacked.mp4
```
If `--gl gpu` gives a black frame, use `--gl auto` (Windows default). Expected: a few minutes on the RTX 4060.

## Engine changes (backward compatible)
`render.mjs` reads `CHROMIUM_PATH` (Linux cloud browser); `engine/player.js` uses `E.captionFn` when a kit sets it; `engine/styles.js` adds a `toon` style.

Nothing was posted, uploaded or scheduled.
