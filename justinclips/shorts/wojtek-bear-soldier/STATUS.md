STATE: ready

# Wojtek the Soldier Bear: status

- `video.mp4`: 1080x1920, 24 fps, 520 frames, 21.67 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers). QC numbers in `project/qc.json`.
- Audio: `audio/mix.py` (music `toon3d:warm` -18 dB, SFX cues from `lines.json`), then the measured gain pass + true-peak limiter in `build_short.py`: **-14.08 LUFS integrated, true peak -1.18 dBTP**.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 6 lines. Line 2 is voiced from its `"tts"` respelling "Voytek" (captions keep "Wojtek"). Whisper QA flags line 2 only because Whisper writes what it hears as "Wojtek", which is the right result. Every other part passed. Script alignment 59/59 words.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = the bear already walking upright with an AMMO crate while soldiers cheer + top caption "Polish Army, WWII: / his favourite drink was beer". Ends on "...a bear carrying a shell." (the badge) and cuts back to frame 1 (loop). No CTA.
- Tone guard: wholesome; no combat shown or claimed; nobody hurt.
- Hedges: "reportedly" on the Monte Cassino crates; "listed him as a soldier" (the British Library calls the formal enlistment partly legend), no rank, serial number or rations claimed. See `sources.md`.
- Shot timing is generated from `project/lines.json` + the voice's word timings (not hard-coded). Note for a new voice: keep or update line 2's `"tts"` respelling (same word count as `"text"`).

## Swap the voice (one command)
From the repo root, on a machine with an `origin/iawaken/toon3d-fx` checkout (kit) and `origin/voice-test` (`whatif/voice/`):

    python3 justinclips/tools/build_short.py justinclips/shorts/wojtek-bear-soldier --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice-cmd "python3 my_new_tts.py {script_md} {wav}"

That re-voices from `lines.json`, re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `{script_md}` is a numbered script (one line per VO line, the format `chatterbox_d2.py` / `fenrir.py` read); the command only has to write `{wav}`. Other placeholders: `{plain}` (plain text), `{project}`. Leave out `--voice-cmd` to use the current D2 voice (`--voice-dir <voice-test>/whatif/voice`, venv from `setup_chatterbox.sh`). `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present). The project folder is symlinked into the kit as `projects/wojtek-bear-soldier`.

Not posted or uploaded anywhere.
