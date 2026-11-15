# Justin clips voice test: the owner's cloned voice vs D2

**Use this voice only for Justin clips.** The owner consented on the first line of `../owner_voice_note.m4a`. Whisper
heard it word for word at 0.9-6.3 s: "Yo, it's Justin. This is my real voice, and I'm cool with using it for Justin
Clips." Every description that uses the clone must say "Voice is synthetic." Nothing here was posted or uploaded.

## Files
| File | What | Length |
|---|---|---|
| `justin_v1.mp3` | clone, exaggeration 0.35 / cfg 0.4 | 25.1 s |
| `justin_v2.mp3` | clone, exaggeration 0.5 / cfg 0.4 (**my pick**) | 21.6 s |
| `justin_v3.mp3` | clone, exaggeration 0.65 / cfg 0.3 | 22.2 s |
| `d2_compare.mp3` | A/B: the old D2 deadpan voice (built-in Chatterbox, 0.3 / 0.3, original `chatterbox_d2.py`), 1.2 s pause, then the v2 take | 44.6 s |
| `*.lines.json` | per-line timing, chosen seed, Whisper transcript and QA for each take | |
| `script.md` | the 7-line hook-first test script | |

## Reference clip (`../ref_clean.wav`)
- **Source:** the owner's voice note (48 kHz stereo AAC, 45.1 s, peaks at 0 dBFS).
- **Clipping:** the shouted "20!" at 19.4-19.9 s has 21 clipped samples.
- **Breaths:** the noise floor is about -53 dB. Audible inhales sit at 17.4-17.7 s (before "20 cases") and 27.7-28.0 s (about -42 dB).
- **Kept:** two clean takes from the whale story, without the clip or either breath:
  - 7.25-17.20 s: "Okay, so, get this. In 1970 Oregon had a dead whale on a beach... Bro, let's just blow it up."
  - 20.50-27.50 s: "The whale exploded... one piece landed on a brand new car and crushed it."
  - They are joined with 0.35 s of the room's own tone (taken from 31.1 s) and 20-80 ms fades.
- **Processing:**
  - Mono downmix, 70 Hz high-pass, light FFT denoise (`afftdn nr=8 nf=-50`).
  - Two-pass loudnorm to -20 LUFS / -1.5 dBTP.
  - 24 kHz 16-bit mono.
  - Result: **17.3 s**, -19.9 LUFS, peak -2.2 dBFS.
- **Whisper on the reference:** "Okay so get this, in 1970 Oregon had a dead whale on the beach and instead of like dragging it away they said bro let's just blow it up. The whale exploded, chunks of blood of flight went flying everywhere and one piece landed on a brand new corner and crushed it."

## Render settings (all versions)
- **Model and voice:** Chatterbox TTS (Resemble AI, MIT), CPU, with `audio_prompt_path` = `ref_clean.wav`, temperature 0.8.
- **Generation:** each script line is rendered in one pass. Seeds are 7, 11 and 23, tried in that order.
- **QA per line:** Whisper small.en must match word for word. As of this run there is also a pitch-glitch check: a take is rejected if more than 10% of its voiced frames sit over 9 semitones above the owner's median pitch (119 Hz). That catches squeaks Whisper can't hear.
- **Pacing:** 0.15 s lead-in, 0.3 s between lines, plus 0.12 s after a "?".
- **Master:**
  - Two-pass loudnorm to -14 LUFS / -1 dBTP, 48 kHz mono.
  - Then a +0.5 dB top-up through a 4x-oversampled limiter, and 192 kbps MP3.
  - Measured on the MP3s: **-14.1 to -14.2 LUFS, true peak -1.7 to -1.8 dBTP**.
- **D2:** rendered with the original `chatterbox_d2.py` (`--gap 0.3 --comma 0.15 --lead 0.15`), then mastered the same way.

## Whisper QA (per line, chosen take)
All four takes passed: every line matched word for word, with no squeaks.

| Line | v1 (0.35/0.4) | v2 (0.5/0.4) | v3 (0.65/0.3) | D2 |
|---|---|---|---|---|
| 1 Oregon blew up a whale. With dynamite. | seed 7 | seed 7 | seed 7 | seed 7 |
| 2 Yo, it's Justin, and this actually happened. | seed 7 | seed 7 | seed 7 | seed 11 (seed 7 said "Dustin") |
| 3 An explosives guy said twenty sticks would do it. | seed 7 | seed 7 | seed 11 (seed 7: **29% squeak, rejected**) | seed 7 |
| 4 They used twenty CASES. | seed 7 | seed 7 | seed 7 | seed 7 |
| 5 One chunk reportedly flew a quarter mile... | seed 7 | seed 11 (seed 7: "crashed") | seed 7 | seed 7 |
| 6 And most of the whale? Still there. | seed 7 | seed 7 | seed 7 | seed 7 |
| 7 Oregon named a park after it. Exploding Whale Memorial Park. | seed 7 | seed 11 (seed 7: "the park") | seed 11 (seed 7: "exploding well") | seed 7 |

## Whisper transcripts of the final MP3s (whole file)
- **v1:** Oregon blew up a whale with dynamite. Yo, it's Justin and this actually happened. An explosives guy said 20 sticks would do it. They used 20 cases. One chunk reportedly flew a quarter mile and crushed a brand new car. And most of the whale, still there. Oregon named a park after it. Exploding Whale Memorial Park.
- **v2:** Oregon blew up a whale, with dynamite. Yo, it's Justin, and this actually happened. An explosives guy said 20 sticks would do it. They used 20 cases. One chunk reportedly flew a quarter mile and crushed a brand new car. And most of the whale, still there. Oregon named a park after it. [Exploding] Whale Memorial Park.
  - The whole-file decode clipped the final segment, giving "...after it." on one pass and "Whale Memorial Park." on another.
  - The isolated line and a decode of the last 4.5 s both hear "Exploding Whale Memorial Park" in full.
  - "Exploding" comes quickly in v2, so give it a listen. If it feels rushed, re-render that line with `--seeds 23`.
- **v3:** Oregon blew up a whale with dynamite. Yo, it's Justin, and this actually happened. An explosives guy said 20 sticks would do it. They used 20 cases. One chunk reportedly flew a quarter mile and crushed a brand new car. And most of the whale, still there. Oregon named a park after it. Exploding Whale Memorial Park.
- **d2_compare:**
  - D2 part: Oregon blew up a whale. With dynamite, yo, it's Justin and this actually happened. An explosives guy said 20 sticks would do it. They used 20 cases. One chunk reportedly flew a quarter mile and crushed a brand new car. And most of the whale, still there. Oregon named a park after it. Exploding Whale Memorial Park.
  - v2 part: Oregon blew up a whale. With dynamite. Yo, it's Justin. And this actually happened. (the rest is the same as v2)

## Measurements
- **Speaker similarity:** cosine similarity of Chatterbox's own VoiceEncoder embedding against `ref_clean.wav`.
- **Pitch:** pyin, in semitones around each file's median.

| | similarity to owner | median F0 | F0 SD (st) | F0 90% range (st) | speech rate (words/s, speech only) | LRA |
|---|---|---|---|---|---|---|
| owner reference | 1.000 | 119 Hz | 2.57 | 7.7 | about 4 | |
| v1 0.35/0.4 | **0.918** | 118 Hz | 2.40 | 6.4 | 2.50 | 3.9 LU |
| v2 0.5/0.4 | 0.910 | 121 Hz | 2.30 | 6.4 | **2.96** | 3.0 LU |
| v3 0.65/0.3 | 0.902 | 126 Hz | 2.01 | 6.5 | 2.86 | 2.3 LU |
| D2 (built-in voice) | 0.751 | 116 Hz | 5.48 | 17.8 | 2.91 | |

## My pick: **v2 (exaggeration 0.5, cfg 0.4)**
- **Most like the owner:** all three clones are clearly the owner's voice and far from D2 (similarity 0.90-0.92 vs 0.75).
  - v1 scores highest on raw similarity.
  - v2 and v3 are within 0.01-0.02 of it, which is inside take-to-take noise.
- **Most natural for "telling a friend a crazy story":** v2.
  - Pace: v2 is the fastest and punchiest, at 2.96 words/s.
  - v1 drags at 2.5 words/s. "Yo, it's Justin..." takes 3.9 s against 2.8 s in v2, and drawn-out lines are what make cloned TTS sound flat.
  - v3 (exaggeration 0.65, cfg 0.3) drifts sharp of the owner (126 vs 119 Hz median).
  - v3 produced the only squeak/falsetto glitch (line 3, seed 7) and the most word slips, so it is the least stable.
  - v2 keeps the owner's pitch (121 Hz) with no glitches.
- **Caveat:** none of the takes reach the owner's real pace (about 4 words/s) or pitch movement (7.7 st). This is the usual limit of a 17 s clone on Chatterbox.
- **If the owner wants more energy:** try `--exag 0.55 --cfg 0.35` before going to 0.65.
- **Status:** this pick comes from QA logs and measurements, not a human listen. The owner should A/B `justin_v1`/`v2`/`v3` and confirm.
- **Default:** `../justin_tts.py` defaults to v2's settings.

## Reuse
```
bash justinclips/voice_justin/setup_chatterbox.sh                  # once: ~/.venvs/chatterbox
~/.venvs/chatterbox/bin/python justinclips/voice_justin/justin_tts.py script.md voiceover.wav plain.txt --mp3
#   defaults: --exag 0.5 --cfg 0.4 --temp 0.8 --gap 0.3 --lead 0.15 --seeds 7,11,23 --lufs -14 --tp -1.0
```
- **Script format:** numbered lines (`1. ...`), the same as `chatterbox_d2.py`.
- **Text handling:** "..." inside a line is a held beat (`--beat 0.5`). Digits are spelled out for the TTS only.
- **Outputs:** writes `voiceover.lines.json` with timings and QA for captions.
- **Speed:** on this 4-core CPU a 7-line Short renders in about 2.5-3.5 min.
