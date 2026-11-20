# Voice takes (exaggeration 0.55, cfg 0.3, normal speed)

score = pitch range + 0.5 × loudness swing (higher = more animated). Pick = top score that passes the Whisper word check (`vo/whisper_check.md`). Chatterbox's own QA counts digits vs spelled numbers as wrong.

| take | length | words/s | pitch range | loudness swing | score | Chatterbox QA wrong words |
|---|---|---|---|---|---|---|
| seed11 | 22.32 s | 3.36 | 12.2 st | 15.5 dB | 19.95 | 2 |
| seed7 | 23.24 s | 3.23 | 12.4 st | 15.0 dB | 19.91 | 2 |

**Pick: seed7.** It scores the same as seed11 (19.91 vs 19.95), but seed11 failed the Whisper word check ("Pay two hundred" was heard as "Paid 200"). seed7 passes.
