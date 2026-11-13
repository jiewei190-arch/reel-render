# Tardigrade: The Animal That Survived Space Naked (Justin clips, Toon 3D + BEANMEN effects)
Voice: **Chatterbox D2** (owner's pick, Nov 13: built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`
(`--gap 0.3 --comma 0.15 --lead 0.15`), deadpan; held 0.7 s beats ("...") before "and the animals were alive", "naked" and "is this guy".
Voice script: `projects/tardigrade-space/input/voice_script.md` = the owner's 8 lines (same text as the voice-test proof take) + "9. Subscribe for more.".
Every part passed Whisper QA on seed 7 (lines 1-8 have the same timings as `voice_test/tardigrade_d2.lines.json`); "2007" is spoken "two thousand seven"
and Whisper hears "In 2007". Captions show digits (2007, 1000x, 10, 8) from `input/script.txt`.
Length 38.05 s (voice 38.22 s incl. tail silence; closer 36.72-37.92 s = 1.2 s), 913 frames @ 24 fps. The old Kokoro Fenrir take is replaced.

| # | t (s) | Narration (spoken) | Captions (digits) | Shot | FX / transition |
|---|---|---|---|---|---|
| 1 | 0.0 | In two thousand seven, | In 2007, | s01 FRAME 1: tardigrade floating in space, thumbs up, hook "THIS ANIMAL SURVIVED SPACE. NAKED." | sparkle, riser |
| 1 | 2.0 | scientists strapped tiny animals to the outside of a satellite. | ... OUTSIDE ... | s02 lab: Dr Lin tapes tiny tardigrades to the satellite tray; Dr Ade shrugs at the lens | whipBlur in; ??? + sweat on the rider, ! on Ade |
| 2 | 4.95 | No suits. | | s03 satellite in orbit over Earth | cut, sparkle |
| 2 | 5.85 | No oxygen. | | s04 the tray: sunbathers in tiny sunglasses | cut, sparkle |
| 2 | 7.1 | Just open space, for ten straight days. | 10 | s05 DAY 1 > DAY 10 counter; pose changes every flip (newspaper, pushups, wave, nap) | whipBlur; zzz, sparkle, ding on "10" |
| 3 | 9.7 | The radiation out there | | s06 meter slams past MAX, glass cracks, alarm spins; the sunbather doesn't care | shake + flash + "!" + red alarm pulse |
| 3 | 11.6 | is a thousand times stronger than on Earth. | 1000x | s07 INSERT counter "1,000x / SOLAR RADIATION OUT THERE / vs. Earth's surface" | flash in |
| 4 | 13.45 | When the satellite came home, | | s08 capsule lands under its parachute on the sunny steppe (sunny sky preset) | iris; dust, shake, thud |
| 4 | 15.0 | they checked the bodies. | | s09 tweezers up, push in to an extreme close-up of a sweating face | sweat x2, heartbeat |
| 5 | 16.75 | And the animals were alive. | ALIVE | s10 microscope view, tardigrades strolling | iris open; "!" + flash + sparkle on ALIVE |
| 6 | 18.6 | Some even laid eggs. | | s11 an egg pops out; Dr Lin faints in the background | pop, hearts, stars (dizzy) |
| 7 | 20.5 | They're called tardigrades. | TARDIGRADES | s12 close-up wave in the moss; sticker "TARDIGRADE / a.k.a. water bear" | whipBlur; hearts, sparkle |
| 7 | 22.05 | Half a millimeter long, lives in moss, | | s13 moss forest + ruler; chips "0.5 mm", "lives in moss" | pops on the words |
| 7 | 24.3 | looks like a gummy bear with eight legs. | 8 | s14 next to a gummy bear: ??? then "!" and chip "8 LEGS" | squeak, ding |
| 8 | 26.35 | And now it's the first animal in history | | s15 proud float over the Earth | fade; spotlight, sparkle |
| 8 | 29.2 | to survive outer space. | | s16 INSERT versus "IN OPEN SPACE: SUIT + OXYGEN vs NOTHING" | whipBlur |
| 9 | 31.4 | Naked. | NAKED. | s17 astronaut vs tardigrade, WINNER arrow to the bear | flash; ! + sweat on the astronaut, shake |
| 10 | 32.5 | Which means the toughest astronaut ever... | | s18 tiny helmet + trophy "TOUGHEST ASTRONAUT EVER" | spotlight, sparkle, bell |
| 11 | 34.95 | is this guy. Subscribe for more. | this guy. | s19 waves at the lens, helmet pops off on "Subscribe", pulls back to the frame-1 framing | hard cut -> loops to frame 1 |

Music: kit bed `toon3d:curious` (-18 dB, ducked under the voice by mix.py). 44 kit sfx cues (several on spoken words).
The optional line "Some even laid eggs" was kept (verified, and it fits: 37 s total).
