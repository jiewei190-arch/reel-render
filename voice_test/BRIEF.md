# Voice test (owner: "the voice over sounds too ai")

Goal: find a narrator for the Justin clips Shorts that sounds like a real person, not AI. Today we use Kokoro am_fenrir via `whatif/voice/fenrir.py` (speed 0.95, short gaps). Make comparison samples so the owner can pick by ear.

TEST LINES (same for every sample, ~15 s):
"In 2007, scientists strapped tiny animals to the outside of a satellite. No suits. No oxygen. Just open space for ten straight days. When the satellite came home, they checked the bodies... and the animals were alive."
(TTS text spells the year as "two thousand seven".)

CANDIDATES (only models whose code AND weights allow commercial use; check each license, skip any non-commercial one like XTTS-v2 / F5-TTS weights):
A. Current: Kokoro am_fenrir 0.95 as in production (the baseline).
B. Kokoro, best other male voice(s): try am_michael, am_puck, am_echo, bm_george, bm_lewis; keep the 2 most natural.
C. Kokoro with better PROSODY on the best voice: synthesize sentence by sentence, vary pauses (short after commas, longer before the reveal "and the animals were alive"), slight speed variation per sentence (0.92-1.0), then light post: high-pass 80 Hz, gentle compression, a touch of room ambience, -14 LUFS.
D. Chatterbox (Resemble AI, MIT license; pip install chatterbox-tts; runs on CPU, slow is OK for 15 s): default voice, and exaggeration ~0.5 / cfg ~0.5; also a lower-energy deadpan setting. Do NOT clone any real person's voice.
E. Any other commercial-OK open model that runs on CPU here and sounds clearly more human (e.g. StyleTTS2 LibriTTS, MIT). Optional.

Deliver on branch `voice-test`, folder `voice_test/`: `A_current.wav`, `B1_*.wav`, `B2_*.wav`, `C_kokoro-prosody.wav`, `D1_chatterbox.wav`, `D2_chatterbox-deadpan.wav`, (E...), each normalized to -16 LUFS, plus also ONE `all_samples.mp4` (black 1080x1920 with a big label "A", "B1"... shown during each sample, 1 s silence between) so the owner can listen on a phone. `RESULTS.md`: per sample the model, voice, license, render speed on this CPU (s per 10 s of audio), and your honest ranking for "sounds human". STATUS.md first line `STATE: ready` when pushed. `git add -f` wav/mp4.

Rules: never post/upload/log in anywhere; no voice cloning of real people; no paid APIs/keys.
