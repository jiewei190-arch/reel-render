STATE: ready

# The Secret Cinema Under Paris — status

- `video.mp4`: 1080×1920, 24 fps, 996 frames, 41.5 s, H.264 + AAC, 16 MB. sha256 in `video.sha256`
  (7a73f3ddbdfd85bf434cd872b6f54e68f17cdf8f00ab2f9df05e555dd716d022). Rendered in full in the cloud (SwiftShader, ~12 min).
- Audio: mix.py master -14.4 LUFS integrated, true peak -1.00 dBTP (ffmpeg loudnorm/ebur128 on the final file).
  Music bed `toon3d:mystery` at -19 dB, ducked under the voice; 48 SFX cues. The two dog barks are `sfx/woof.wav`, made
  procedurally by `projects/paris-secret-cinema/gen_woof.py` (no samples).
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py
  (`--gap 0.25 --lead 0.1 --beat 0.45`). The raw take is 43.9 s, kept as input/voiceover_raw.wav. It was tightened by
  projects/paris-secret-cinema/tighten_vo.py 1.05 (pauses capped at 0.3 s, line gaps 0.2 s, +0.3 s beat before
  "But here's the part…", +0.2 s before line 11), giving a 40.2 s VO and a 1.3 s hold on the payoff card.
  TTS-QA "fails" on lines 2 and 10 are spelling only (Whisper wrote "Trocadero" and "UX").
- QA: Whisper small.en on the final video.mp4 reads the script word for word (122 words; only diffs: Trocadéro → "Trocadero",
  U.X. → "UX").
- Contact sheet (`contact_sheet.png`, every 42nd frame from the final) checked. Fixes made after the first stills:
  the projector was moved out of frames 1 and the last shot, the seats, projector and film-tin shots were reframed wider,
  the ossuary wall now sits inside the tunnel vault so it can be seen, the dark shots got bigger and brighter torch pools,
  the map card was moved up off the caption line, and the note card now pops on "a note…".
- Brief: line 1 is 11 words with the WTF first. Frame 1 is already moving (torch beams sweep onto the cinema) with the
  2-line top caption "2004 / a secret CINEMA under PARIS" from 0 to 3.5 s (gold 2004/CINEMA, red PARIS). The "But…" turn
  is line 6 (18.8 s), with an escalation roughly every 7 s (bar/restaurant → hidden power and phone → fake barking dogs → les UX →
  dismantled). The 17 shots cut about every 1.5-3.2 s, with punch-ins inside s09, s13 and s15. The payoff "Do not search."
  lands in the last 2 s. The last shot is the same dark cave and framing as frame 1, with the two beams on the floor,
  so it loops.
- Wording vs the card: the first line was shortened from the card's 2-sentence hook. "les UX" is said as "the U.X."
  "Took responsibility" is kept exactly. The escalations in lines 8, 9 and 11 come from the linked Wikipedia article
  "Les UX" (quoted in sources.md), not from "Catacombs of Paris".
- Tone: the ossuary is tidy stacked toon bones, with no gore and no jokes about the dead. UX members are silhouettes. There are no logos or insignia.
- Nothing was posted, uploaded or scheduled anywhere.

Re-render, from whatif/aitrends-2d-studio:
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py ../../justinclips/shorts/paris-secret-cinema/tts_script.md projects/paris-secret-cinema/input/voiceover_raw.wav projects/paris-secret-cinema/input/script.txt --gap 0.25 --lead 0.1 --beat 0.45
    ~/.venvs/chatterbox/bin/python projects/paris-secret-cinema/tighten_vo.py 1.05
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/paris-secret-cinema --script projects/paris-secret-cinema/input/script.txt --lang en --model small
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/paris-secret-cinema --out projects/paris-secret-cinema/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project projects/paris-secret-cinema --video projects/paris-secret-cinema/build/video_silent.mp4   # -> out/The_Secret_Cinema_Under_Paris.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256 (+ tts_script.md).
