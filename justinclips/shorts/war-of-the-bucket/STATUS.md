STATE: ready

# War of the Bucket: status

- `video.mp4`: 1080x1920, 24 fps, 557 frames, 23.21 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 8m25s). QC numbers in `project/qc.json`.
- Audio: `audio/mix.py` (music `toon3d:upbeat` -19 dB, SFX cues from `lines.json`), then a measured gain pass + true-peak limiter in `build_short.py`: **-14.05 LUFS integrated, true peak -1.13 dBTP**.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 6 lines, seed 7. Whisper QA passed on every part except "and won.", which Whisper hears as the homophone "and one." (all 3 seeds). The audio says "won"; kept seed 7. Script alignment 53/56 words (the 3 misses are interpolated; captions use the script's wording).
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = the red army already charging at the bucket + top caption "Italy, 1325: / about 39,000 soldiers showed up" (first tile of `contact_sheet.png`). Ends on "...about 700 years later." and the bucket in its case hard-cuts back to the charge (loop). No CTA.
- Fact fix during the build: the brief's hook ("went to war over a bucket") is the legend. Sources say the bucket was taken AFTER the battle as a trophy. So the VO opens "**Legend says** two cities went to war over a bucket. The truth is pettier." See `sources.md`.
- Shot timing is not hard-coded: `project/lines.json` holds the narration and, per line, the shots (anchored to the line start or to a word). `story/shots.json` is generated from it plus the voice's word timings.

## Swap the voice (one command)
From the repo root, on a machine with an `origin/iawaken/toon3d-fx` checkout (kit) and `origin/voice-test` (`whatif/voice/`):

    python3 justinclips/tools/build_short.py justinclips/shorts/war-of-the-bucket --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice-cmd "python3 my_new_tts.py {script_md} {wav}"

That re-voices from `lines.json`, re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `{script_md}` is a numbered script (one line per VO line, the format `chatterbox_d2.py` / `fenrir.py` read); the command only has to write `{wav}`. Other placeholders: `{plain}` (plain text), `{project}`. Leave out `--voice-cmd` to use the current D2 voice (`--voice-dir <voice-test>/whatif/voice`, venv from `setup_chatterbox.sh`). `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present). The project folder is symlinked into the kit as `projects/war-of-the-bucket`.

Not posted or uploaded anywhere.
