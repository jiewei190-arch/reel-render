# Voice takes (exaggeration 0.55, cfg 0.3, normal speed)

score = pitch range + 0.5 × loudness swing (higher = more animated). Pick = top score that passes the Whisper word check (`vo/whisper_check.md`). Chatterbox's own QA counts digits vs spelled numbers as wrong.

| take | length | words/s | pitch range | loudness swing | score | Chatterbox QA wrong words |
|---|---|---|---|---|---|---|
| seed11 | 24.46 s | 2.9 | 13.1 st | 16.8 dB | 21.5 | 3 |
| seed7 | 24.4 s | 2.91 | 12.9 st | 15.3 dB | 20.53 | 2 |

**Pick: seed7**. Seed 11 scored higher, but Whisper heard its hook word "POV" as "Puff".
