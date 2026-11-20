STATE: ready

# The Great Hedge of India — status

- `video.mp4`: 1080×1920, 24 fps, 41.6 s (target 40-48), H.264 + AAC, 17 MB. sha256 in `video.sha256`. Rendered in full in the cloud (12.5 min, 4 workers).
- Audio: mix.py master **-14.2 LUFS** integrated, true peak **-1.3 dBTP** (ffmpeg ebur128 on the final file). Music `toon3d:mystery` -19 dB, 47 SFX cues.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py, `--gap 0.3 --comma 0.15 --lead 0.15`;
  raw take 45.4 s (`input/voiceover_raw.wav`), every line passed TTS QA (line 8 on seed 11, the rest seed 7). Tightened by
  `projects/great-hedge-india/tighten_vo.py` (pauses capped at 0.3 s, gaps 0.14 s, atempo 1.04 with pitch kept, held beats
  +0.25 s before "But here's the twist...", +0.1 s before line 8, +0.2 s before "What he found") → 41.1 s.
- QA: Whisper small.en on the final video.mp4 reads the script word for word (it writes "British ruled" without the hyphen and "London Library" capitalised; the audio is correct).
- Contact sheet (`contact_sheet.png`, every 50th frame of the final) checked: no dead frames, no clipping, captions readable and
  clear of the top caption and stamps, tone guard respected.

## Source fixes (lines checked against sources.md before voicing)
- Line 1 + top caption: the ~2,500 mi was the whole customs line, and only part of it was thorn hedge (at least ~800 mi of live hedge,
  plus dry hedge, stone wall and rivers). "a 2,500-mile wall of thorns" was changed to **"a 2,500-mile barrier across India"**,
  and the caption "2,500 miles of thorns" to **"a 2,500-mile barrier / then FORGOTTEN"**.
- Line 9: Moxham was a *conservator* at the University of London library, not a librarian. Changed to **"a London library conservator"**.
- All other lines match the source. The embankment is shown as a short bank, not one running to the horizon ("one small raised embankment").
  script.md is updated with the same notes.

## Batch 5 rules
- Hook: line 1 is 10 words; frame 1 is already moving (the camera flies down the hedge while the rider walks). The top caption is
  2 lines, centre-top, with "2,500-mile" in gold and "FORGOTTEN" in red, on screen 0-3.5 s.
- Escalations: salt tax at ~7 s, the map draws the line at ~11 s, the hedge grows at ~14 s, 12 FT at ~16 s, VS Great Wall at ~18 s,
  the 14,000+ counter at ~22 s, "BUT..." at 24.3 s, ABANDONED at 28 s, FORGOTTEN at 29 s, "!" in the library at 33.6 s, the
  embankment at 38 s. 16 shots, cuts every ~1.4-2.7 s, with punch-ins inside s01 and s12 and inserts inside s05 and s09.
- Payoff: "It may be all that's left." over the last 2.0 s. Shot s16 is the same flyover as frame 1 with only the short embankment left,
  and it ends on frame 1's exact camera, so the loop cut brings the whole hedge back.
- UPLOAD.md has a title, a description with sources, "Voice is synthetic." and a cover frame, and **no hashtags or tags**.

## Tone guard
- No jokes about guards or villagers. The customs men (mixed Indian skin tones, khaki uniforms) stand at attention and are
  shown plainly. The villager at the barrier looks neutral to mildly worried, with no caricature. The WTF comes from the scale
  (map, 12 FT ruler, 14,000+ counter, VS card) and from the forgetting (blank chapter, embankment).
- No violence. "Smugglers" is shown only as a cart stopped at a barrier pole.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio:
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/great-hedge-india --workers 4 --out projects/great-hedge-india/build/video_silent.mp4
    python3 audio/mix.py --project projects/great-hedge-india --video projects/great-hedge-india/build/video_silent.mp4   # -> out/The_Great_Hedge_of_India.mp4
Voice: ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py projects/great-hedge-india/input/tts_script.md projects/great-hedge-india/input/voiceover_raw.wav projects/great-hedge-india/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15
       then (in the project dir) ~/.venvs/chatterbox/bin/python tighten_vo.py 1.04 ; ~/.venvs/chatterbox/bin/python ../../tools/transcribe.py --project . --script input/script.txt --lang en --model small
       (then words.json: "In" at line 8 was moved to 26.19 s; Whisper had put it 0.5 s early.)

Deliverables: script.md, sources.md, tts_script.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
