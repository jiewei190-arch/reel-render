STATE: ready

# The Pig War: status

- `video.mp4`: 1080x1920, 24 fps, 648 frames, 27.00 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers). QC numbers in `project/qc.json`.
- Audio: `audio/mix.py` (music `toon3d:upbeat` -19 dB, SFX cues from `lines.json`), then the measured gain pass + true-peak limiter in `build_short.py`: **-14.07 LUFS integrated, true peak -1.32 dBTP**.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 7 lines. Whisper QA passed on every part except line 4, where Whisper writes "10 dollars" as "$10" (a formatting mismatch, not a wrong word; kept seed 7). Script alignment 63/65 words.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = the pig trotting between the two armies + top caption "San Juan Island, 1859: / a 12-year standoff". Ends on "...was the pig." and hard-cuts back to frame 1 (loop). No CTA.
- Tone guard (brief): the pig is never shown being shot. "He shot it." cuts away to birds bursting out of a tree with an off-screen BANG; the payoff is a cheerful angel pig. No gun is pointed at anyone or anything.
- Fact choices: the first landing is "soldiers" (sources say 64 or 66), the ships are "five warships" with "2,000+ men aboard" (gun counts disagree, so none is used), and the potato dialogue is left out (Wikipedia calls it likely apocryphal). See `sources.md`.
- Known nit: in s03b ("both sides claimed") the island's pines partly hide the two flags; the BOTH CLAIMED IT tag carries the beat.
- Shot timing is generated from `project/lines.json` + the voice's word timings (not hard-coded).

## Swap the voice (one command)
From the repo root, on a machine with an `origin/iawaken/toon3d-fx` checkout (kit) and `origin/voice-test` (`whatif/voice/`):

    python3 justinclips/tools/build_short.py justinclips/shorts/pig-war --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice-cmd "python3 my_new_tts.py {script_md} {wav}"

That re-voices from `lines.json`, re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `{script_md}` is a numbered script (one line per VO line, the format `chatterbox_d2.py` / `fenrir.py` read); the command only has to write `{wav}`. Other placeholders: `{plain}` (plain text), `{project}`. Leave out `--voice-cmd` to use the current D2 voice (`--voice-dir <voice-test>/whatif/voice`, venv from `setup_chatterbox.sh`). `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present). The project folder is symlinked into the kit as `projects/pig-war`.

Not posted or uploaded anywhere.
