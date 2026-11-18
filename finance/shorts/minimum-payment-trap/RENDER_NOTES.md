# minimum-payment-trap: render notes (helper worker)

Composition: `src/fin/minpay.tsx` (Remotion + three.js, blocky-render-2 copy). Comp id `MinimumPaymentTrapSub` (4 sub-frames, tmix motion blur).
Final: **v6** (`video.mp4` = v6 + voice). 1080x1920, 30 fps, 800 frames, 26.67 s.

## Versions (render time = bundle excluded, GPU lock waits excluded; CONC=6, SUB=4)
| v | what | render |
|---|---|---|
| v1 | first full render after ~6 rounds of stills (framing per shot) | 115 s |
| v2 | pedestal made darker + S13 holo tag moved clear of the counter | 116 s |
| v3 | block text cream instead of pure white (caption-edge critic) | 113 s |
| v4 | pedestal ring darker | 113 s |
| v5 | road kerb less white (new `kerb` prop on Ground) | ~115 s |
| v6 | kerb darker; final | 113 s |

## Audio
Gain + true-peak limiter (mux_voice.sh), AAC 256k/48k, no music: **-14.1 LUFS integrated, true peak -1.5 dBFS** (re-muxed with MAIN's tools/mux_voice.sh; the first push was -14.5 / -1.0) (ebur128 on the final mp4).

## Critic (tools/critic.py on v6)
SYNC 18/18 cuts exact (0 frames off). STATIC longest still run 0.03 s. SOUND voice only.
EDGES reports "0.4 %" = FAIL. This is a false positive of the quarter-size pure-white test: the caption itself spans 27-73 % of the width (full-res check `tools/edgefull.py`/crop: captions never come near the edge); the flagged pixels are bright scene highlights at the frame edge in S03 (pedestal/block). I darkened every white scene object I could find (v2-v6) but the test still trips on S03. flicker.py: 11 spikes, strongest at S12 (calendar pages flying past the lens, intended) and a coin at the S09/S10 cut.

## Counter logic (self-consistent)
Min route: balance = 5000 until the 1 % slice ($4,950 after month 1, $92 interest paid), then balance(Y)=5000*(1-Y/19)^1.4, interest(Y)=8099*(1-(1-Y/19)^1.5), year label floored; payment = balance * (22 %/12 + 1 %). Flat lane: real amortisation of $5,000 at 22 % APR with $200/month (paid off after 33.7 months = 2.8 years, interest $1,746).

## Known gaps
- S11 crawl pose is a rough "hands and knees" (block floats just behind his back).
- Whisper/ending moods draw a dusk/night sky (library mood); S11-S16 are darker than the sunny S01-S10.
- Min-route curve is an illustrative shape that ends exactly at 19 years / $8,099 (the numbers from sources.md), tagged EXAMPLE on screen.
- Statement panel text is plain "MINIMUM PAYMENT WARNING" (no issuer name).
