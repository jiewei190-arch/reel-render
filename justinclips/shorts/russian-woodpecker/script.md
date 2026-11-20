# The Russian Woodpecker — script & shot list

**EMOTION:** WTF
**LINE 1:** "For 13 years, a mystery tapping hijacked radios worldwide." (9 words; the card's long first line, shortened)
**CAPTION (top, frame 1 → 3.5 s):** "the WOODPECKER" / "hijacked the world's RADIOS" (2 lines; Woodpecker gold, radios red)
**Frame 1:** a giant wall of antennas in a snowy forest at dusk, already pulsing out sound-wave rings; a toon radio on a
stump in front hops with each pulse and tips off. Already moving.

**Slug:** `russian-woodpecker` · YouTube Short, 9:16, 1080×1920, 24 fps · target 40–48 s · Toon 3D
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then
`projects/russian-woodpecker/tighten_vo.py`. Numbers are digits here (captions keep digits); the TTS says them.
**Tapping SFX:** original, synthesized in code (`make_taps.py`): 10 clicks a second on a 10 Hz grid. No recordings.

## Narration (exact VO)
1. For 13 years, a mystery tapping hijacked radios worldwide.
2. July 1976. Shortwave radios suddenly started doing... this.
3. 10 sharp taps a second. Over and over and over.
4. It hopped across frequencies, drowning out broadcasts, ham radio, even aviation.
5. Listeners nicknamed it the Russian Woodpecker.
6. But here's the part... the Soviet Union never claimed it.
7. Radio hobbyists and NATO triangulated it to a spot near Chernobyl.
8. It was a giant Soviet radar, watching for missiles over the horizon, at over 10 megawatts.
9. Thousands of complaints poured in. Some radios even came with Woodpecker Blankers, just to block it.
10. In 1989, the tapping finally stopped.
11. But the giant antenna is still standing, abandoned, in the woods near Chernobyl.

Escalations: line 2 (the beat is filled by the tapping itself), line 4 (aviation), line 6 "But here's the part...",
line 9 (blankers), line 11 "But..." payoff. The last shot ends on the antenna wall in frame 1's framing → loop.

## Shots (timed to the tightened VO, 43.1 s; final shot times in STATUS.md)
| # | VO | Scene | FX |
|---|---|---|---|
| s01 | 1 | HOOK: Duga antenna wall in a snowy forest, dusk; sound rings pulse out; radio on a stump hops and tips off | top caption, snow, tap SFX |
| s02 | 2 | 1976 living room: a listener in an armchair, his shortwave radio starts tapping, he jolts | "JULY 1976" stamp, "TAP TAP TAP" bursts |
| s03 | 3 | Close-up: the radio's speaker grille thumping; punch-in | "10 TAPS / SECOND" card |
| s04 | 4 | Tuning dial, the woodpecker mark hops band to band (NEWS / HAM / AVIATION); cut to a ham operator covering his ears | dial card, "!" |
| s05 | 5 | A cartoon woodpecker pecking the top of the radio (the nickname, dramatised) | "RUSSIAN WOODPECKER" stamp |
| s06 | 6 | Dim office: a grey official at a desk shrugs and looks away | "UNCLAIMED" stamp |
| s07 | 7 | Map card: three listening posts draw bearings that cross near Chernobyl | dashed lines, "X" |
| s08 | 8 | The antenna wall, low hero angle, a tiny guard at its foot; then a horizon-arc card | "OVER-THE-HORIZON RADAR", "OVER 10 MW" |
| s09 | 9 | Mail sacks of complaints fall in; then a radio with a "WOODPECKER BLANKER" button pressed — the bird gets a cork | "THOUSANDS OF COMPLAINTS" |
| s10 | 10 | The living room: the radio goes quiet, the listener relaxes | "1989" stamp, "zzz" |
| s11 | 11 | PAYOFF: the same antenna wall, silent, snow falling, rust; camera settles into frame 1's framing → loop | "STILL STANDING" stamp |

## Tone guard
- No radiation/disaster jokes and no reactor imagery: Chernobyl is a place name on a map and a caption only.
- No real flags, emblems or logos. The official is generic; nobody is mocked.
- The woodpecker bird is the nickname made visible, not a claim.
