STATE: ready

# Kentucky Meat Shower: status

- `video.mp4`: 1080x1920, 24 fps, 519 frames, 21.63 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers). QC numbers in `project/qc.json`.
- Audio: `audio/mix.py` (music `toon3d:upbeat` -19 dB, SFX cues from `lines.json`), then the measured gain pass + true-peak limiter in `build_short.py`: **-14.07 LUFS integrated, true peak -1.27 dBTP**.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 6 lines. Whisper QA passed on every part except "...and guessed mutton. Or venison.", where Whisper hears "guessed" as "guest" on all 3 seeds (near-homophone; kept seed 7). Script alignment 48/51 words.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = big cartoon chunks already falling over the barn + top caption "Kentucky, 1876: / chunks about 2 inches wide". Ends on "Throwing up mid-flight." and the falling chunks cut back to frame 1 (loop). No CTA.
- Tone guard: cartoon steak chunks only (pink + cream fat stripe), no blood, no gore, no photos.
- Hedges kept: "reportedly" on the tasting; "the most popular explanation" for the vultures (not "solved"); "(species: unclear)" on the lab card. "Near Rankin", common online, is unsupported and not used. See `sources.md`.
- Shot timing is generated from `project/lines.json` + the voice's word timings (not hard-coded).

## Swap the voice (one command)
From the repo root, on a machine with an `origin/iawaken/toon3d-fx` checkout (kit) and `origin/voice-test` (`whatif/voice/`):

    python3 justinclips/tools/build_short.py justinclips/shorts/kentucky-meat-shower --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice-cmd "python3 my_new_tts.py {script_md} {wav}"

That re-voices from `lines.json`, re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `{script_md}` is a numbered script (one line per VO line, the format `chatterbox_d2.py` / `fenrir.py` read); the command only has to write `{wav}`. Other placeholders: `{plain}` (plain text), `{project}`. Leave out `--voice-cmd` to use the current D2 voice (`--voice-dir <voice-test>/whatif/voice`, venv from `setup_chatterbox.sh`). `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present). The project folder is symlinked into the kit as `projects/kentucky-meat-shower`.

Not posted or uploaded anywhere.
