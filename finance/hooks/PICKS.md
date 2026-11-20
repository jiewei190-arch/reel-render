# Hook openings: takes and picks

Voice: Chatterbox D2 (built-in voice, no cloning), **exaggeration 0.55, cfg 0.3**, normal pace (no speed-up), lead 0.15 s.
2 seeds per line (7 and 11). `takes/` has both; `voice.wav` is the pick. Timings: `vo/timings.json` (transcribe.py).
Whisper word check (`finance/tools/verify_words.py`): **PASS** on all three picks. (Chatterbox's own QA flags B because
Whisper writes "$8,000"; the words match.)

Nobody listened by ear. "Punchiest" is measured: pitch range (semitones, 10–90th pct), loudness swing (dB) and pace.
score = pitch + 0.5 × swing.

| hook | line | take | length | words/s | pitch range | loudness swing | score | pick |
|---|---|---|---|---|---|---|---|---|
| A | Spender just bought a TV. He'll be paying for it for nineteen years. | seed 11 | 4.07 s | 3.20 | 17.5 st | 17.0 dB | 26.0 | **✓** |
| A | | seed 7 | 4.14 s | 3.14 | 11.5 st | 15.3 dB | 19.1 | |
| B | This guy is about to pay eight thousand dollars... for nothing. | seed 7 | 4.31 s | 2.55 | 11.6 st | 17.2 dB | 20.2 | **✓** (same score as 11, tighter: the "..." beat lands sooner) |
| B | | seed 11 | 5.14 s | 2.14 | 11.8 st | 17.5 dB | 20.5 | |
| C | Never pay the minimum. Watch what happens. | seed 11 | 3.15 s | 2.22 | 17.1 st | 21.0 dB | 27.6 | **✓** |
| C | | seed 7 | 3.02 s | 2.32 | 15.3 st | 17.1 dB | 23.9 | |

Re-render: `~/.venvs/chatterbox/bin/python finance/voice/chatterbox_d2.py finance/hooks/<H>/vo/narration.md out.wav out.txt
--gap 0.3 --lead 0.15 --exag 0.55 --cfg 0.3 --seeds <seed>` (`--exag/--cfg` were added to chatterbox_d2.py; defaults stay 0.3).
