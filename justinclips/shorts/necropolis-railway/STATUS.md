STATE: ready

# London's Corpse Train (London Necropolis Railway) — status

- `video.mp4`: 1080×1920, 24 fps, 990 frames, 41.25 s, H.264 + AAC, 20 MB. sha256 in `video.sha256`
  (d04a22683a67847d4801010ed64ec129fa2cfac9227d96f7ee327b0ea6e2fdaf). Rendered in full in the cloud (SwiftShader, ~10.5 min).
- Audio: mix.py master **-14.3 LUFS** integrated, **true peak -1.4 dBTP** (ffmpeg ebur128 on the final file). Music bed toon3d:curious, 51 SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py, seeds 7/11/23 with Whisper QA (raw take 43.4 s,
  kept as input/voiceover_raw.wav). Tightened by projects/necropolis-railway/tighten_vo.py: internal pauses capped at 0.3 s,
  line gaps 0.26 s (`GAP=0.26`), **atempo 1.0** (the raw take was already brisk: the bat-bomb 1.17 would have made it 35 s, under the
  40-48 s target), +0.25 s beat before line 7 ("But here's the part"), +0.3 s before the payoff. VO 40.78 s.
- QA:
  - TTS QA "fail" on line 8 is spelling only: Whisper writes "firemen" for "fireman" on all three seeds (same sound).
  - Whisper small.en on the final file: 126/128 words exact. Besides "firemen", it wrote "or the living" for "for the living".
    A 2.6 s clip cut from the final mix (17.0-19.6 s) is transcribed "and by class, for the living and the dead", and the voice
    track alone reads "for", so the full-file miss is Whisper context, not masking. The "living" pop SFX was dropped and the "class" pop
    softened anyway.
  - Contact sheet (`contact_sheet.png`, every 1.5 s from the final file) checked: no dead frames (the s06 blueprint shows its headings
    from its first frame), captions readable, no clipping. A platform pillar that blocked s02/s05/s08 was moved or removed.
- Batch-6 rules: line 1 = 9 words, WTF first; top caption "the corpse train" (2 lines, corpse red / train gold), on screen 0-3.5 s;
  frame 1 already moving; "But..." turn at line 7 (~22.7 s); cuts every ~1.5-4 s with punch-ins inside s02/s04/s08/s10/s13;
  payoff = last 2.7 s; the payoff ends on frame 1's exact framing (same train, same spot) → loop.
- Wording vs the card: card line 1 "For 87 years, London ran a railway whose only cargo was corpses and the people burying them."
  shortened to "London ran a train line just for dead people." (the 87 years moved to line 9). The card's caption, payoff
  (1854, 23 miles, Brookwood, split by religion and class for the living and the dead, 1941 air raid, never ran again) kept.
  Added from the same article: the 1842 Royal Commission finding, one-way coffin tickets, golfers disguised as mourners, the 1867 drunk
  driver. "Wrecked" (not "destroyed") for the terminus: the article says "badly damaged ... rendered unusable"; see sources.md.
- Kit change: `kits/toon3d/rig.js` gains `head: 'tophat'` (additive; other projects unchanged).
- TONE GUARD: closed coffins only, no bodies or gore; mourners drawn sad and dignified; the 1941 raid shown on an empty building.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (Chatterbox venv for Python; it has scipy + faster-whisper):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py ../../justinclips/shorts/necropolis-railway/tts_script.md projects/necropolis-railway/input/voiceover_raw.wav projects/necropolis-railway/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15
    (cd projects/necropolis-railway && GAP=0.26 ~/.venvs/chatterbox/bin/python tighten_vo.py 1.0)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/necropolis-railway --script projects/necropolis-railway/input/script.txt --lang en --model small
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/necropolis-railway --workers 4 --format jpeg --out projects/necropolis-railway/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project projects/necropolis-railway --video projects/necropolis-railway/build/video_silent.mp4   # -> out/Londons_Corpse_Train.mp4 (990 frames)

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256 (+ tts_script.md).
