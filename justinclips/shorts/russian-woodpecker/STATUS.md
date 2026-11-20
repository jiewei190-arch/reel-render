STATE: ready

# The Russian Woodpecker — status

- `video.mp4`: 1080×1920, 24 fps, 1034 frames, 43.08 s, H.264 + AAC, 29 MB. sha256 in `video.sha256`. Rendered in full in the cloud
  (whatif/aitrends-2d-studio, Toon 3D, swiftshader, 4 workers, 14m43s).
- Audio: mix.py master **-14.3 LUFS integrated, true peak -1.3 dBTP** (ffmpeg ebur128 on the final file). Music: kit "mystery" at -20 dB.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 49.0 s, QA OK on all 11 lines
  (seed 7 each; kept as input/voiceover_raw.wav). Tightened by projects/russian-woodpecker/tighten_vo.py to 42.5 s: pauses capped at
  0.3 s (0.6 s kept in line 2's "doing... this" beat, where the taps play; 0.45 s in "the part..."), atempo 1.08 with pitch kept,
  **line 9 at 1.03** (at 1.08 Whisper heard "Blankers" as "blinkers"), +0.15 s beat before line 6, +0.2 s before the payoff.
- Tapping SFX: original, synthesized by projects/russian-woodpecker/make_taps.py (10 clicks/second: band-passed noise burst + ringing
  tone + low thump, light saturation, faint hiss). No recordings of the real signal are used.
- **Whisper QA** (small.en, beam 5) on the final mp4: 115/116 words match the script (99.1%). The one miss: "Woodpecker **Blankers**" is
  transcribed "blinkers". The voice track alone and the voice-only master read "blankers"; the voice-only mix before loudness
  normalisation reads "blinkers", so Whisper is borderline on this word rather than hearing a clear mispronunciation. The burned
  caption and the "WOODPECKER BLANKER" stamp show the word on screen. **Worth one listen at ~34 s before upload.**
- Contact sheet (contact_sheet.png, from the final file, every 1.8 s): no dead frames, no clipped captions/stamps; captions sit at
  72% height clear of cards. Known small overlaps left in: the "!" over the JULY 1976 stamp (~7.9 s), and falling letters crossing the official's face in s09.
- Batch-6 rules: line 1 = 9 words, WTF first; frame 1 already moving (wall pulsing, radio hopping) with the 2-line top caption
  "the Woodpecker / hijacked the world's radios" (Woodpecker gold, radios red) held 0–3.5 s; "But here's the part..." at 18.5 s;
  escalations at ~3.5 / 11.8 / 18.5 / 30.2 / 38.8 s; cuts or punch-ins every ~1.6–2.5 s; payoff line in the last 4.3 s; the last shot
  dollies into frame 1's exact framing (stump + radio + wall) → loop. No hashtags/tags in UPLOAD.md.
- Shot times: s01 0.00–3.50 · s02 3.50–8.38 · s03 8.38–11.77 · s04 11.77–16.07 · s05 16.07–18.47 · s06 18.47–21.69 · s07 21.69–25.44 · s08 25.44–30.23 · s09 30.23–35.88 · s10 35.88–38.81 · s11 38.81–43.10
- Nothing was posted, uploaded or logged in anywhere.

## Wording changes vs the card
- Line 1 shortened to 9 words. The card's "and nobody outside the USSR knew what it was" is **not used**: Wikipedia says
  experts suspected an over-the-horizon radar "even from the earliest reports" and NATO had a reporting name. The supported fact,
  that the signal was "unclaimed", became line 6: "the Soviet Union never claimed it."
- "radio makers literally added Woodpecker Blankers" → "Some radios even came with Woodpecker Blankers" (Wikipedia: "some
  communications receivers").
- The card's "knock radios off tables" is a cartoon gag only (the radio tips off a stump in frame 1), not a claim.
- en.wikipedia.org/wiki/Russian_Woodpecker now redirects to "Duga radar"; sources.md quotes that article.

## Rebuild (from whatif/aitrends-2d-studio; Python tools run in ~/.venvs/chatterbox, set up by whatif/voice/setup_chatterbox.sh)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py projects/russian-woodpecker/input/tts_script.md projects/russian-woodpecker/input/voiceover_raw.wav projects/russian-woodpecker/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python projects/russian-woodpecker/tighten_vo.py            # -> input/voiceover.wav (42.5 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/russian-woodpecker --script projects/russian-woodpecker/input/script.txt --lang en --model small
    ~/.venvs/chatterbox/bin/python projects/russian-woodpecker/make_taps.py             # -> sfx/taps_*.wav
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/russian-woodpecker --workers 4 --out projects/russian-woodpecker/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project projects/russian-woodpecker --video projects/russian-woodpecker/build/video_silent.mp4   # -> out/The_Russian_Woodpecker.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
