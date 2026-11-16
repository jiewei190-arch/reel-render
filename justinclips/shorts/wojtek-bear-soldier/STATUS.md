STATE: ready

# Wojtek the Soldier Bear: status

- `video.mp4`: 1080x1920, 24 fps, 492 frames, 20.50 s, H.264 + AAC. sha256 in `video.sha256` (efe933d36661…). Rendered fully in the cloud (SwiftShader, 4 workers). QC numbers in `project/qc.json`.
- Audio: `audio/mix.py` (music `toon3d:warm` -18 dB, SFX cues from `lines.json`), then the measured gain pass + true-peak limiter in `build_short.py`: **-14.03 LUFS integrated, true peak -3.17 dBTP** (ffmpeg ebur128 on the mp4: -14.1 LUFS, peak -3.2 dBFS).
- Voice: **dia #8** (Dia-1.6B-0626, Apache-2.0; `voice_lineup/tts_any.py --engine dia`, prompt `prompts/dia_prompt_kokoro_am_puck.wav` + its prompt text, `--dia-tail " (laughs)"`, cfg 3.0, temp 1.8, top-p 0.9, top-k 45), **seed 6**, whole script in one pass, via `tools/revoice/dia8.py`. Median pitch 219 Hz (reference 08_dia_puckprompt-seed7.mp3: ~205 Hz). The (laughs) tail is cut 0.12 s after "shell" and is not in the audio. Dia hears "Voytek" through `lines.json` "pronounce": {"dia": {"Wojtek": "Voytek"}} (captions keep "Wojtek"). Pacing (`lines.json` "pacing"): Dia's own phrasing, with at least 0.4 s between lines and 0.6 s at the "..." (Dia's take alone is 19.4 s; this keeps the Short over 20 s without cutting words). Take report: `project/input/dia8_report.json`.
  - Seeds: full takes 7 (172 Hz, 18.6 s), 11 (279 Hz; Whisper heard "bear wrestling") and 1 (119 Hz) were rejected; seeds 3-14 were then screened on their first 4 s and 6 was rendered in full and kept.
  - Whisper small.en on the final mix: "A bear served in the army and carried ammo. In 1942, Polish soldiers in Iran adopted a bear cub named Wojtek. He loved beer, wrestling, and long showers. To ship him to Italy, the army listed him as a soldier. At Monte Cassino, he reportedly carried crates of artillery shells. His unit's badge became a bear carrying a shell." Word for word. Script alignment 59/59 words.
  - QA: caption sync checked on 10 word-time frames + frame 1 + last frames; no black/blank frames (the two dark spans, 6.71-6.88 s and 13.50-13.67 s, are the designed iris wipes, caption on screen; the original has the same two). With the faster voice, s05 and s06 ("He loved beer, / wrestling,") run 0.73 and 0.59 s.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = the bear already walking upright with an AMMO crate while soldiers cheer + top caption "Polish Army, WWII: / his favourite drink was beer". Ends on "...a bear carrying a shell." (the badge) and cuts back to frame 1 (loop). No CTA.
- Tone guard: wholesome; no combat shown or claimed; nobody hurt.
- Hedges: "reportedly" on the Monte Cassino crates; "listed him as a soldier" (the British Library calls the formal enlistment partly legend), no rank, serial number or rations claimed. See `sources.md`.
- Shot timing is generated from `project/lines.json` + the voice's word timings (not hard-coded). Note for a new voice: keep line 2's `"tts"` respelling (Chatterbox/fenrir) and the `"pronounce"` map (dia8.py / tts_any.py).

## Swap the voice (one command)
From the repo root, with an `origin/iawaken/toon3d-fx` checkout (kit, `npm install` done) and the Dia venv (Python 3.12, CPU torch, transformers>=4.56, librosa, scipy, faster-whisper; see `voice_lineup/NOTES.md`):

    python3 justinclips/tools/build_short.py justinclips/shorts/wojtek-bear-soldier --kit <toon3d-fx>/whatif/aitrends-2d-studio \
      --whisper-py ~/.venvs/dia/bin/python --mix-py ~/.venvs/dia/bin/python \
      --voice-cmd "~/.venvs/dia/bin/python justinclips/tools/revoice/dia8.py --project {project} --wav {wav} --seed 6"

That re-voices from `lines.json` with dia #8 (about 6 min of CPU on 4 vCPU), re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `dia8.py` needs `justinclips/voice_lineup/` (set `VOICE_LINEUP` if elsewhere). Add `--keep DIR` to keep the raw take and `--reuse DIR` to re-pace a kept take without re-running Dia. Any other voice: `--voice-cmd "python3 my_new_tts.py {script_md} {wav}"`. `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present).

Not posted or uploaded anywhere.
