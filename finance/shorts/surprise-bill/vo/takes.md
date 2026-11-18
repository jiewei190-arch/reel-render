# Voice takes (exaggeration 0.55, cfg 0.3, normal speed)

score = pitch range + 0.5 × loudness swing (higher = more animated). Pick = top score that passes the Whisper word check (`vo/whisper_check.md`). Chatterbox's own QA counts digits vs spelled numbers as wrong.

| take | length | words/s | pitch range | loudness swing | score | Chatterbox QA wrong words |
|---|---|---|---|---|---|---|
| seed11 | 28.97 s | 2.93 | 14.5 st | 17.1 dB | 23.03 | 5 |
| seed7 | 28.39 s | 2.99 | 14.5 st | 15.7 dB | 22.41 | 4 |

**Pick: seed7.** seed11 scores 0.6 higher but fails the Whisper check ("Saver" was heard as "savor"). seed7 passes.
