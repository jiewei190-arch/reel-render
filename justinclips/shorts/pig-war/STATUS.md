STATE: ready

# The Pig War: status

- `video.mp4`: 1080x1920, 24 fps, 525 frames, 21.88 s, H.264 + AAC. sha256 in `video.sha256` (905f4a8cb988…). Rendered fully in the cloud (SwiftShader, 4 workers). QC numbers in `project/qc.json`.
- Audio: `audio/mix.py` (music `toon3d:upbeat` -19 dB, SFX cues from `lines.json`), then the measured gain pass + true-peak limiter in `build_short.py`: **-14.01 LUFS integrated, true peak -2.25 dBTP** (ffmpeg ebur128 on the mp4: -13.8 LUFS, peak -2.2 dBFS).
- Voice: **dia #8** (Dia-1.6B-0626, Apache-2.0; `voice_lineup/tts_any.py --engine dia`, prompt `prompts/dia_prompt_kokoro_am_puck.wav` + its prompt text, `--dia-tail " (laughs)"`, cfg 3.0, temp 1.8, top-p 0.9, top-k 45), **seed 10**, whole script in one pass, via `tools/revoice/dia8.py`. Median pitch 206 Hz (reference 08_dia_puckprompt-seed7.mp3: ~205 Hz). The (laughs) tail is cut 0.12 s after "pig" and is not in the audio. Pacing (`lines.json` "pacing"): Dia's own phrasing, with at least 0.3 s between lines and 0.5 s at each "..." (cut points at the quietest spot, every piece re-checked with Whisper). Take report: `project/input/dia8_report.json`.
  - Seeds: full takes 7 (Whisper heard "arrest American sent soldiers", pitch 236 Hz), 11 (304 Hz), 1 (garbled) and 2 (259 Hz) were rejected; seeds 3-14 were then screened on their first 4 s (same seed = same opening) and 10 was rendered in full and kept.
  - Whisper small.en on the final mix: "America and Britain almost went to war over a pig. In 1859, on an island both sides claimed, a British company's pig got into an American's garden. He shot it. He offered $10. The British wanted $100. Britain threatened to arrest him, so America sent soldiers. Soon, 461 American troops faced five British warships. Nobody fired a shot. The only casualty was the pig." Word for word ("$10" is Whisper's way of writing "10 dollars"). Script alignment 64/65 words.
  - QA: caption sync checked on 10 word-time frames + frame 1 + last frames; no black/blank frames (the only dark span, 20.50-20.67 s, is the designed iris wipe into s14, caption still on screen; same as before). Shots are shorter with the faster voice: s05, s06 and s13b run 0.83-0.86 s.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = the pig trotting between the two armies + top caption "San Juan Island, 1859: / a 12-year standoff". Ends on "...was the pig." and hard-cuts back to frame 1 (loop). No CTA.
- Tone guard (brief): the pig is never shown being shot. "He shot it." cuts away to birds bursting out of a tree with an off-screen BANG; the payoff is a cheerful angel pig. No gun is pointed at anyone or anything.
- Fact choices: the first landing is "soldiers" (sources say 64 or 66), the ships are "five warships" with "2,000+ men aboard" (gun counts disagree, so none is used), and the potato dialogue is left out (Wikipedia calls it likely apocryphal). See `sources.md`.
- Known nit: in s03b ("both sides claimed") the island's pines partly hide the two flags; the BOTH CLAIMED IT tag carries the beat.
- Shot timing is generated from `project/lines.json` + the voice's word timings (not hard-coded).

## Swap the voice (one command)
From the repo root, with an `origin/iawaken/toon3d-fx` checkout (kit, `npm install` done) and the Dia venv (Python 3.12, CPU torch, transformers>=4.56, librosa, scipy, faster-whisper; see `voice_lineup/NOTES.md`):

    python3 justinclips/tools/build_short.py justinclips/shorts/pig-war --kit <toon3d-fx>/whatif/aitrends-2d-studio \
      --whisper-py ~/.venvs/dia/bin/python --mix-py ~/.venvs/dia/bin/python \
      --voice-cmd "~/.venvs/dia/bin/python justinclips/tools/revoice/dia8.py --project {project} --wav {wav} --seed 10"

That re-voices from `lines.json` with dia #8 (about 6 min of CPU on 4 vCPU), re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `dia8.py` needs `justinclips/voice_lineup/` (from origin/justinclips/voice-lineup; set `VOICE_LINEUP` if elsewhere). Add `--keep DIR` to keep the raw take and `--reuse DIR` to re-pace a kept take without re-running Dia. Any other voice: `--voice-cmd "python3 my_new_tts.py {script_md} {wav}"`. `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present).

Not posted or uploaded anywhere.
