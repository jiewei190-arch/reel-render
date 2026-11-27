STATE: ready

# The Axolotl Regrows: status

- `video.mp4`: 1080×1920, 24 fps, 998 frames, 41.6 s (target 40–48), H.264 + AAC 192k, 19 MB. sha256 in `video.sha256`. Rendered in full in the cloud (SwiftShader, 4 workers, 12m59s).
- Audio: final file -14.1 LUFS integrated, true peak -1.6 dBTP (ffmpeg loudnorm measurement on video.mp4).
  mix.py (music `toon3d:curious` at -21 dB, ducked; kit SFX cues) gave -14.22 LUFS / TP -1.50. A measured second pass (+0.22 dB, limiter at 0.8) gave the master; it was muxed with `-c:v copy`.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.4`. Raw take 41.89 s; every line passed Whisper QA
  (line 6 seed 11, because seed 7 said "wild parts"; all others seed 7). Raw take kept as `input/voiceover_raw.wav`.
  `projects/axolotl-regrows/tighten_vo.py`: NO speed-up (atempo 1.0, because 1.03 would land under 40 s), pauses capped at 0.32 s, 0.2 s gaps, beats before lines 5, 6, 8, 10 → 41.20 s of voice + 0.35 s hold.
- QA: Whisper small.en on the final video.mp4 reads the script word for word, including "axolotl" and "50 to 1,000".
- Contact sheet (`contact_sheet.png`): 26 frames from the final file, red boxes = Shorts UI zones. Checked: frame 1 is already moving (leg regrowing, sparkles) with the 2-line top caption;
  captions sit between the zones; the three insert cards read; the last frame (41.5 s) matches frame 1's camera, with the leg just gone "poof" → loops into the regrowing leg.
  Fixed after the storyboard check: most cameras were too close (head cropped); the x-ray heart/brain icons were too small; the spinal-cord shot became a top view so the whole body fits;
  the human finger was too big; the "CRITICALLY ENDANGERED" card title was cramped (now "IN THE WILD: CRITICALLY" / "ENDANGERED"); a bandage on the finger was removed (it implied an injury).
- Rules: hook line 12 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, HEART gold / BRAIN red; "But" turns at 14.4, 20.7 and 27.3 s, with escalations in between;
  24 shots plus 2 internal hard cuts → a cut every ~0.9–2.5 s; reaction FX after every reveal; 3 insert cards (ITS BRAIN, ENDANGERED, 50 – 1,000);
  payoff "...but not its home" 38.8–39.6 s; closer "Subscribe for more." 39.98–41.1 s (< 1.5 s).
- Tone: no injury shown (the leg goes "poof" to a dotted outline and regrows; no blood, wound or bandage); the endangered status is said plainly; no dead animals.

## Changed vs the brief / fact choices
- Brief's line "regrow its legs, heart and even parts of its brain": kept, worded "its legs, its heart, even parts of its brain" (Nat Geo: "limbs, hearts, spinal cords, and even parts of their brains");
  line 5 uses "parts of its heart", matching Wikipedia's "tissues of the eye and heart".
- "Larval form for life" → "It keeps its larval body for life, frilly gills and all" (ADW + Wikipedia + Nat Geo).
- "Critically endangered in the wild near Mexico City" → "critically endangered" + "down to a few canals near Mexico City" + "maybe 50 to 1,000 adults left" (Wikipedia + Nat Geo agree on 50–1,000).
- The line count is 11 including the closer, as the rules allow. No size or regeneration-count figures (the sources disagree or don't give one).
- Builder: the Woolpit manual pipeline was used (shots.json from `story/make_shots.py`), with the same measured two-pass loudness step as `build_short.py`.
- Nothing was posted, uploaded or logged in anywhere.

## Re-render, from whatif/aitrends-2d-studio (P=projects/axolotl-regrows)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/tts_script.md $P/input/voiceover_raw.wav $P/input/script.txt --gap 0.2 --lead 0.05 --beat 0.4
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py                       # -> input/voiceover.wav (41.20 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    (cd $P && python3 story/make_shots.py)                                # -> story/shots.json
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    # measure build/mix.wav, apply volume=(-14 - I) dB + alimiter=limit=0.8 -> build/master.wav, then mux with -c:v copy -c:a aac -b:a 192k

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256, tts_script.md.
