# What if Earth stopped spinning for one second? (Justin clips, Toon 3D + BEANMEN effects)

Voice: **Chatterbox D2** (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --lead 0.15`, then `tighten_vo.py` (atempo 1.0, pauses capped 0.32 s, 0.18 s gaps + held beats).
Format: what-if **thought experiment** (said in line 2), following NASA Goddard Q&A pages (see sources.md). Cartoon chaos only, nobody hurt.
TTS text spells numbers ("sixteen hundred", "two milliseconds"); captions and script.txt show digits (1,600, 2).

## Narration (120 words incl. closer, 11 lines)

1. (0.05-4.00 s) If Earth stopped spinning for one second, everything would fly sideways.
2. (4.18-8.40 s) Relax. It's a thought experiment, but scientists have worked out what happens.
3. (8.68-12.75 s) At the equator, the ground spins east at over sixteen hundred kilometers an hour.
4. (12.93-16.46 s) You, the air, the oceans, and that cow are all moving with it.
5. (16.84-20.27 s) But hit the brakes for one second, and only the ground stops.
6. (20.45-24.02 s) Everything not bolted down keeps going, sliding east at full speed.
7. (24.40-27.76 s) But it gets worse. The oceans would slosh right over the land.
8. (27.94-30.94 s) But stand on the North Pole, and you'd barely move at all.
9. (31.37-34.65 s) The good news? NASA says stopping Earth would take a miracle.
10. (34.93-38.89 s) It is slowing down... by about two milliseconds per century.
11. (39.32-40.55 s) Subscribe for more.

## Shots

| Shot | t (s) | Line | Picture / FX | Transition |
|---|---|---|---|---|
| s01 | 0.00-2.52 | If Earth stopped spinning for one second, everyt | FRAME 1: equator farm already sliding east (cow, chickens, hay, barrels, farmer flailing); top caption "if EARTH STOPPED / for 1 SECOND" | - |
| s01b | 2.52-4.06 | If Earth stopped spinning for one second, everyt | hard cut, low: cow + chickens sail past east, speedlines; caption holds to 3.5 s | cut |
| s02 | 4.06-6.52 | Relax. It's a thought experiment, but scientists | freeze-frame mid-air, pause icon, stamp THOUGHT EXPERIMENT | flash |
| s03 | 6.52-8.56 | Relax. It's a thought experiment, but scientists | scientist bean, desk globe, clipboard, nods | whipBlur |
| s04 | 8.56-10.66 | At the equator, the ground spins east at over si | toon globe spinning, EQUATOR chip, arrow EAST | iris |
| s05 | 10.66-12.81 | At the equator, the ground spins east at over si | INSERT counter "1,600+ KM/H" over the globe | whipBlur |
| s06 | 12.81-14.96 | You, the air, the oceans, and that cow are all m | calm farm: chips YOU / AIR / OCEANS, each with an arrow east | whipBlur |
| s07 | 14.96-16.72 | You, the air, the oceans, and that cow are all m | cow close-up turns to camera, chip "1,600 km/h too", ? | cut |
| s08 | 16.72-18.78 | But hit the brakes for one second, and only the  | globe spinning fast, STOP sign slams in, globe halts; flash + shake | whipBlur |
| s09 | 18.78-20.33 | But hit the brakes for one second, and only the  | low farm: frozen beat, chip "GROUND: 0 km/h", farmer ???, then it all leans east | cut |
| s10 | 20.33-22.54 | Everything not bolted down keeps going, sliding  | wide: everything slides east; BOLTED sign stays put (chip) | cut |
| s11 | 22.54-24.28 | Everything not bolted down keeps going, sliding  | tracking: farmer and cow sail past, speedlines, stamp FULL SPEED | whipBlur |
| s12 | 24.28-25.68 | But it gets worse. The oceans would slosh right  | coast town, a giant cartoon wave rises out at sea, stamp IT GETS WORSE | flash |
| s13 | 25.68-27.82 | But it gets worse. The oceans would slosh right  | the wave rolls over the empty town (SLOSH!); the cow bobs by on a rubber ring, hearts | whipBlur |
| s14 | 27.82-29.92 | But stand on the North Pole, and you'd barely mo | North Pole: striped N pole, bean with cocoa; far away stuff zips by; chip NORTH POLE | iris |
| s15 | 29.92-31.25 | But stand on the North Pole, and you'd barely mo | close-up smug sip, chip "about 0 km/h" | cut |
| s16 | 31.25-32.52 | The good news? NASA says stopping Earth would ta | globe spinning happily, stamp GOOD NEWS | whipBlur |
| s17 | 32.52-34.81 | The good news? NASA says stopping Earth would ta | INSERT bigtext "NASA: STOPPING EARTH / MIRACLE / would take a" | cut |
| s18 | 34.81-35.78 | It is slowing down... by about two milliseconds  | globe, slower, clock icon, chip "slowing down..." | fade |
| s19 | 35.78-37.76 | It is slowing down... by about two milliseconds  | INSERT counter "A DAY GETS LONGER BY ~2 ms / per century" (payoff) | whipBlur |
| s19b | 37.76-39.20 | It is slowing down... by about two milliseconds  | reaction: farmer wipes brow, grins; chip "~2 ms per century" | cut |
| s20 | 39.20-41.20 | Subscribe for more. | back to frame 1 camera on the calm farm; last 0.3 s the slide starts -> loops into frame 1 | iris |

Insert cards: s05 (1,600+ KM/H), s17 (MIRACLE), s19 (~2 ms per century). "But" turns: 6.0 s (line 2), 16.8 s (line 5), 24.4 s (line 7), 27.9 s (line 8), 31.4 s ("The good news?").
Music: kit bed `toon3d:curious` (-20 dB, ducked by mix.py). SFX: kit cues per shot in story/shots.json.
