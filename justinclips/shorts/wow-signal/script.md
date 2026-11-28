# The Wow! Signal — script & shot list

**EMOTION:** WTF → LOL (deadpan narrator, the jokes are in the pictures)
**Slug:** `wow-signal` · YouTube Short, 9:16, 1080×1920, 24 fps · **45.5 s** (target 40–48) · Toon 3D + BEANMEN FX
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py` → `input/voiceover_raw.wav`
(line 10 re-taken as "...with over 10,000 tweets" and spliced in by `splice_line.py`), tightened by `tighten_vo.py 1.08`
(pauses capped 0.3 s, held "..." beats kept at 0.5 s, beats before lines 6/8/9/11) → 45.3 s of voice + 0.5 s tail.
Numbers are spelled out in `input/voice_script.md` for the TTS; captions use the digits in `input/script.txt`.

**LINE 1 (12 words, WTF first):** "In 1977, a telescope caught a signal so weird someone wrote 'Wow!'"
**TOP CAPTION (frame 1 → 3.5 s, 2 lines, centre-top):** "1977: a **SIGNAL** so weird" / "someone wrote **"WOW!"**" (SIGNAL gold, WOW! red)
**Frame 1 (signature gag, seen in the first 2 s):** the fanfold computer printout chattering up out of a 1970s printer, the 6EQUJ5
column right in the middle, and a red marker already drawing the circle round it. "Wow!" is scribbled on the word "Wow" (s03).
**Loop:** s26 (closer) dollies back to frame 1's exact camera over a fresh sheet; the pen arrives at the circle's start → cut to s01.

## Recipe (from the Russian Woodpecker)
- WTF true-story hook in ≤ 12 words · signature visual = the printout + red circle + "Wow!" (frame 1, again in s13 and s23)
- mystery (72 s, never repeated, comets blamed) → **"But here's the part..."** (32.6 s) → reveal (2024 hydrogen-cloud hypothesis)
- payoff in the last ~2 s before the closer: "...with over 10,000 tweets." → closer "Subscribe for more." (1.4 s) → loop

## Narration (exact VO, 122 words)
1. In 1977, a telescope caught a signal so weird someone wrote "Wow!"
2. Ohio's Big Ear radio telescope was listening for alien signals.
3. Its printout was code: numbers meant weak, letters meant strong.
4. Then, on August 15, it printed: 6, E, Q, U, J, 5.
5. That U was about 30 standard deviations above the noise.
6. Days later, Jerry Ehman circled it and wrote: "Wow!"
7. It lasted 72 seconds, exactly as long as Big Ear could watch one spot.
8. They listened again for decades. Nothing. Comets got blamed. Astronomers said nope.
9. But here's the part... a 2024 study says a cold hydrogen cloud may have suddenly flared.
10. Still unconfirmed. But in 2012, someone replied anyway... with over 10,000 tweets.
11. Subscribe for more.

Escalations: 5.1 s (Big Ear + the giant ear) · 12.3 s (the printer jolts: 6EQUJ5) · 17.7 s (U busts the chart) · 21 s ("Wow!") ·
26.9 s (decades + cobwebs) · 32.6 s "But here's the part..." · 37.2 s (the cloud flares) · 42.1 s (10,000+ tweets).

## Visual gags (each one shows a real fact)
1. **Big Ear, literally**: on the word "Ear" a giant cartoon ear pops up behind the real-shaped telescope field (the telescope's name).
2. **Listening for aliens**: a tiny astronomer stands on the reflector cupping his ear at the sky, "???" (Big Ear was a SETI instrument).
3. **The code**: quiet 1s with "zzz" (digits = weak) → the alphabet bounces in shouting (letters = strong).
4. **The U bar busts through the top of the chart — CRACK!** (U = 30–31 standard deviations, the peak of 6-14-26-30-19-5).
5. **Double take + "Wow!"**: the astronomer leans in, eyes pop, sweat; the red circle + "Wow!" (Ehman circled it and wrote "Wow!").
6. **Decades of nothing**: years flip 1980s→2020s, cobwebs grow, the beard grows in; "SIGNALS FOUND: 0" (it never recurred).
7. **Comets blamed**: two toon comets with faces, giant red arrows point at them, they sweat → two astronomers shake heads, "NOPE." (the 2017 comet idea was rejected).
8. **Cold hydrogen cloud**: a shivering cloud ("brrr") flares hot pink when a star flashes, shocked face, "MAYBE?" (2024 hypothesis, not confirmed).
9. **The reply**: a big radio dish fires a stream of speech bubbles into space, "10,000+ TWEETS" (2012).
Silence beats: "Nothing." (0.9 s deadpan shrug) and "But here's the part..." (0.5 s held beat over a slow push into space).

## Insert cards (big numbers)
s10–s11 "WHAT IT PRINTED" bar chart 6 E Q U J 5 · s14 counter "72 s" · s25 "10,000+ TWEETS".

## Shots (28; timed by make_shots.py from the word timings)
| # | t (s) | Narration | Picture | In |
|---|---|---|---|---|
| s01 | 0.00-2.46 | In 1977, a telescope caught a | FRAME 1: printout chattering, red circle drawing round 6EQUJ5 + top caption | – |
| s02 | 2.46-3.56 | signal so weird someone | astronomer leans in, double take, "!" | cut |
| s03 | 3.56-5.06 | wrote "Wow!" | close paper: "Wow!" scribbled on the word | whipBlur |
| s04 | 5.06-6.74 | Ohio's Big Ear radio telescope was | Big Ear field at night; giant cartoon ear pops up; OHIO, USA / BIG EAR | iris |
| s05 | 6.74-8.50 | listening for alien signals. | tiny astronomer cups his ear at the sky, ??? | whipBlur |
| s06 | 8.50-10.18 | Its printout was code: | printer chattering, THE CODE | cut |
| s07 | 10.18-11.22 | numbers meant weak, | quiet 1s, zzz, "1 2 3 ... 9 = WEAK" | cut |
| s08 | 11.22-12.30 | letters meant strong. | the alphabet bounces in, "A ... Z = STRONG" | flash |
| s09 | 12.30-13.74 | Then, on August 15, it | printer jolts, CHK!, AUG 15, 1977 | whipBlur |
| s10 | 13.74-16.60 | printed: 6, E, Q, U, J, 5. | INSERT: bar per spoken character | cut |
| s11 | 16.60-17.72 | That U was about 30 | the U bar busts the card, CRACK!, "≈ 30 STANDARD DEVIATIONS" | cut |
| s11b | 17.72-19.96 | standard deviations above the noise. | astronomer: eyes pop, sweat, WAY ABOVE THE NOISE | whipBlur |
| s12 | 19.96-20.98 | Days later, Jerry Ehman | at the desk, printouts, DAYS LATER | iris |
| s13 | 20.98-22.88 | circled it and wrote: "Wow!" | SIGNATURE: circle draws on, "Wow!", flash + stars | cut |
| s14 | 22.88-24.70 | It lasted 72 seconds, | INSERT: counter 72 s + stopwatch | flash |
| s15 | 24.70-26.86 | exactly as long as Big Ear could watch one spot. | the sky slides past the fixed beam, IN VIEW | whipBlur |
| s16 | 26.86-29.14 | They listened again for decades. | headphones, 1980s→2020s, cobwebs, beard grows | cut |
| s17 | 29.14-30.04 | Nothing. | bearded deadpan shrug, SIGNALS FOUND: 0 | cut |
| s18 | 30.04-31.14 | Comets got blamed. | two toon comets, red arrows, sweat | whipBlur |
| s19 | 31.14-32.62 | Astronomers said nope. | two astronomers shake heads, NOPE. | cut |
| s20 | 32.62-34.12 | But here's the part... | slow push into deep space (beat) | iris |
| s21 | 34.12-35.90 | a 2024 study says a | the cloud far off, 2024 STUDY / a hypothesis | cut |
| s21b | 35.90-37.24 | cold hydrogen cloud may have | shivering cloud, brrr, COLD HYDROGEN CLOUD | cut |
| s22 | 37.24-38.38 | suddenly flared. | star flashes, cloud flares pink, shocked, MAYBE? | flash |
| s23 | 38.38-39.66 | Still unconfirmed. | astronomer shrugs at the printout, ???, UNCONFIRMED | whipBlur |
| s24 | 39.66-42.14 | But in 2012, someone replied anyway... | big dish at dusk, beam up, 2012 | iris |
| s25 | 42.14-44.10 | with over 10,000 tweets. | PAYOFF: speech bubbles stream up, 10,000+ TWEETS | cut |
| s26 | 44.10-45.54 | Subscribe for more. | closer: frame 1's framing, fresh sheet → loop | cut |

## Tone guard
Generic toon people only (the astronomer is a generic bean, not a likeness of Jerry Ehman). No real logos (the 2012 dish is a generic
dish; the "tweets" are plain speech bubbles, no bird logo). No channel name. The narrator never mocks anyone; "nope" is the
astronomers' own verdict on the comet idea. Explanations are shown as possibilities ("a hypothesis", "MAYBE?", "UNCONFIRMED").
