# Voice test results ("sounds too AI")

Same ~15 s test line in every sample ("two thousand seven" spelled out for TTS). Every WAV is two-pass loudnormed to −16 LUFS (measured −16.0 to −16.5), true peak −1.5 dBFS, 48 kHz mono.
**Listen on a phone:** `all_samples.mp4` (1:57, 1080x1920, big label on screen, 1 s gap between samples).

| # | File | Model / settings | Voice | License (code / weights) | Render on this CPU (4 vCPU) | Starts in mp4 |
|---|---|---|---|---|---|---|
| A | `A_current.wav` | Kokoro v1.0 (kokoro-onnx), speed 0.95, Shorts gaps 0.3/0.15 s, exactly as `whatif/voice/fenrir.py` | am_fenrir | MIT / Apache-2.0 | 3.1 s per 10 s | 0:00 |
| B1 | `B1_kokoro-am_michael.wav` | Kokoro, same production settings | am_michael | MIT / Apache-2.0 | 2.7 s per 10 s | 0:16 |
| B2 | `B2_kokoro-bm_george.wav` | Kokoro, same production settings | bm_george (British) | MIT / Apache-2.0 | 2.5 s per 10 s | 0:35 |
| C | `C_kokoro-prosody.wav` | Kokoro, sentence by sentence, speed 0.92–1.00 per sentence, edge silence trimmed, hand pauses 0.28–0.55 s, **0.95 s beat before "And the animals were alive."**; post: HP 80 Hz, 2.5:1 compression, light short-room echo, LP 15 kHz | am_michael | MIT / Apache-2.0 | 2.5 s per 10 s | 0:55 |
| D1 | `D1_chatterbox.wav` | Chatterbox (chatterbox-tts 0.1.x), exaggeration 0.5, cfg 0.5, seed 7 | built-in default (male, ~130 Hz) | MIT / MIT | **40 s per 10 s** | 1:13 |
| D2 | `D2_chatterbox-deadpan.wav` | Chatterbox, exaggeration 0.3, cfg 0.3 (lower energy, slower) | built-in default | MIT / MIT | 35 s per 10 s | 1:27 |
| E1 | `E1_chatterbox-turbo-female.wav` | Chatterbox-Turbo (350M), defaults | built-in default (**female**, ~220 Hz) | MIT / MIT | 17 s per 10 s | 1:40 |

Other Kokoro male voices were rendered too (am_puck, am_echo, am_onyx, bm_lewis, am_adam). I kept michael and george because Kokoro's own voice grading rates them highest after fenrir; echo, onyx and adam are rated low; and lewis has a very low pitch (77 Hz) with a narrow range. Puck is rated the same as michael but sounds younger and brighter. I can render it on request.

Voice cloning: none. Chatterbox used its built-in default voice; no reference audio of any person was used. Every model here allows commercial use. No paid APIs, keys or logins were used (weights came from the public GitHub release and Hugging Face).

## Checks I could run (I can't listen)
- **Every sample says the whole script.** A Whisper small.en transcript of every final WAV matches the text. An early deadpan take (exaggeration 0.25) came back as "scientists *dropped*" on 3 seeds, so I replaced it with 0.3/0.3, which transcribes as "strapped".
- **Pitch movement** (F0 spread p5–p95, in semitones; more movement usually means less monotone): D1 17.0, B2 16.1, D2 15.9, A 14.6, B1 11.5, C 11.2, E1 8.3.
- **Chatterbox reads the fragments as one flow**: "No suits, no oxygen, just open space…" with no hard stops, and no long beat before the reveal. It finishes in ~12.5 s against ~15.4 s for A. Kokoro reads each fragment as its own sentence, which is part of why it sounds stilted.

## Honest ranking for "sounds human"
I could not hear these. The ranking comes from the published character of each model, the measurements above, and the transcripts. **The owner's ears decide.**
1. **D1 Chatterbox (default).** A newer, LLM-style TTS with natural breaths, varied pitch and connected phrasing. It is the most likely to stop sounding "AI". Downsides: 13x slower than Kokoro (fine for Shorts: ~1.5 min of CPU for a 25 s VO), no direct control of pauses, takes vary by seed (render 2–3 and pick one), and the output carries Resemble's Perth watermark, which you can't hear.
2. **D2 Chatterbox deadpan.** Same voice, calmer. Good if D1 sounds too "announcer".
3. **C Kokoro + pacing.** The pacing and the beat before the reveal fix the rhythm, but it is still Kokoro's timbre. Cheapest upgrade if the owner wants to stay on Kokoro.
4. **B1 Kokoro michael.** Warmer and less "trailer" than fenrir, but the pitch range is narrower.
5. **A current (fenrir).**
6. **B2 Kokoro george.** British documentary feel. A matter of taste, so don't rule it out.
- **E1 Chatterbox-Turbo** is the default female voice. It is included only to show Turbo's quality and speed (2.4x faster than D1). Turbo has no male built-in voice, and getting one would need a reference clip, which means cloning, so it is out of scope here.

Note: StyleTTS2 (E option) was not tried. Its LibriTTS checkpoint is multi-speaker and needs a reference clip for a voice, which runs into the no-cloning rule.

## Reproduce
`src/kokoro_samples.py` (A/B/C), `src/chatterbox_samples.py` (D/E; needs a Python 3.11 venv with `chatterbox-tts`, `setuptools<81`, CPU torch), `src/norm.sh` (−16 LUFS), `src/asr_check.py`, `src/pitch_stats.py`, `src/make_mp4.sh`.
