# The 1908 New York to Paris Race: script & shot list

**EMOTION:** LOL / wow
**LINE 1:** "In 1908, six cars raced around the world to Paris." (10 words; the card's long first line shortened, idea kept)
**CAPTION (top, frame 1 → 3.5 s):** "a car race / AROUND THE WORLD" (gold) + red stamp "IN 1908 CARS"
**Frame 1:** a 1908 toon car sunk in Siberian mud, wheels spinning and throwing mud, two crew hauling it on ropes, four villagers watching, unimpressed. Already moving.

**Slug:** `new-york-paris-race-1908` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.0 s** (target 40-48) · Toon 3D + BEANMEN effects
**Project:** `whatif/aitrends-2d-studio/projects/ny-paris-1908/`
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then
`projects/ny-paris-1908/tighten_vo.py 1.0` (pauses capped at 0.3 s, gaps 0.14 s, +0.2 s beat before lines 6 and 10; no speed-up).
Raw 43.9 s take kept as `input/voiceover_raw.wav`. TTS text in `tts_script.md` (numbers spelled by the voice script); captions keep digits.

## Narration (exact VO)
1. In 1908, six cars raced around the world to Paris.                                  *(hook)*
2. They left Times Square in February, with almost no roads ahead.
3. When the roads ran out, they drove on railway tracks, tie to tie, for hundreds of miles.
4. Alaska was so impossible, the race was rerouted by steamer to Japan.
5. Then Siberia's spring thaw turned the plains into mud.
6. But here's the part... the Germans reached Paris first.                              *(the turn)*
7. They got a thirty day penalty, for skipping Japan and shipping their car part of the way by train.
8. So the American Thomas Flyer won, after 169 days and about 16,700 kilometers.
9. Only three of the six cars ever finished.
10. The winning margin? Twenty-six days... still called the largest in motorsport history.   *(payoff → loop)*

117 words. No "Subscribe" line: the payoff shot returns to frame 1's mud set and camera, so the last frame cuts straight into frame 1.

## Shots (cuts every ~1.5-3.5 s; s04 has a punch-in at "hundreds", s08 a "BUT…" hold then a dolly)
| # | t (s) | Scene | FX |
|---|---|---|---|
| s01 | 0.00–3.25 | Car sunk in Siberian mud, crew hauling on ropes, villagers watching | top caption, "IN 1908 CARS" stamp, sweat |
| s02 | 3.25–5.15 | Snowy Times Square, four cars under a "NEW YORK → PARIS" banner, crowd in coats | "FEB 12, 1908" |
| s03 | 5.15–6.60 | The car rolls up to a "ROAD ENDS" sign, then nothing but snow | "ROADS: ALMOST NONE", "?" |
| s04 | 6.60–11.35 | Car straddling the rails, jolting on every tie; punch-in on the rattled crew | "ON THE RAILS", BUMP ×2, "HUNDREDS OF MILES" |
| s05 | 11.35–13.15 | Car buried in Alaskan snow, driver stands on the seat and shrugs | "ALASKA", "IMPOSSIBLE" |
| s06 | 13.15–15.50 | Car on the deck of a rocking steamer | "BY STEAMER", "→ JAPAN" |
| s07 | 15.50–19.00 | Two cars (USA, GER) wallowing in mud, wheels spinning | "SIBERIA", "MUD" + shake |
| s08 | 19.00–22.35 | Paris finish street: "BUT…" hold, then the GER car rolls in, crew cheers | "GERMANY: FIRST!" |
| s09 | 22.35–24.00 | Close on the German crew: arms drop | "+30 DAYS" / "PENALTY" + flash, shake |
| s10 | 24.00–26.85 | The GER car riding a flatcar behind a steam loco, driver smug | "SKIPPED JAPAN", "BY TRAIN" |
| s11 | 26.85–29.30 | USA car rolls in with a trophy, crowd goes wild | "USA WINS", sparkle/stars |
| s12 | 29.30–33.90 | Counters over the blurred celebration | 0→169 DAYS (FEB 12 → JULY 30, 1908), 0→16,700 KM |
| s13 | 33.90–36.50 | Six car cards: three French crossed out, USA/GER/ITA checked | "ONLY 3 OF 6 FINISHED" |
| s14 | 36.50–39.05 | Empty Paris finish street ("nobody else yet") | "WINNING MARGIN?" → counter 0→26 DAYS |
| s15 | 39.05–42.00 | Back in the frame-1 mud, crew still hauling (car now wears its trophy); camera ends on frame 1's framing | "LARGEST WIN MARGIN / IN MOTORSPORT" |

## Captions (burned, 1–3 words, from the VO; gold on key words: 1908, world, Paris, railway, Alaska, Japan, mud, Germans, first, 30-day, penalty, train, won, 169, 16,700, three, 26, largest, history)

## Tone / brand guard
- No real car-brand logos: every car is the same generic toon tourer with a plain brass radiator, a text team plate (USA/GER/ITA/FRA) and a race number. "Thomas Flyer" is only spoken.
- No national flags anywhere (text labels only). Nobody is hurt; the villagers are generic onlookers, not a costume gag.
