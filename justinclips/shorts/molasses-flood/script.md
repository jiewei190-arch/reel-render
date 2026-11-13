# Molasses Flood 1919: The Boston Tsunami That Killed 21 People (slug `molasses-flood`)

Justin clips Short, Toon 3D + BEANMEN effects, 9:16 1080x1920, 24 fps, **43.7 s** (voice at the locked Fenrir pace; no padding).
Owner's script, with the brief's own length cut applied ("knocks a firehouse off its foundation" removed from the narration;
the firehouse still slides off its foundation on screen in shot 10). Closer: "Subscribe for more." (story answered).

TONE GUARD: 21 people really died. Comedy stays on the phrase, the tank, the speed and the company's excuse. Nobody is shown
hurt or trapped; the wave only hits empty streets, buildings and the elevated railway; no horse gag (the frame-1 horse is
calm, before the hit). The aftermath (shot 12) is a quiet, dimmed beat with sad music and no FX.

## Narration (captions show digits; TTS spells numbers: `input/voice_lines.txt`)
| # | Time | Line | Shot |
|---|---|---|---|
| 1 | 0.0 | You've heard the phrase slow as molasses. | s01 FRAME 1: molasses wave towering over a 1919 street, horse + wagon, hook text "A MOLASSES TSUNAMI / KILLED 21 PEOPLE" |
| 2 | 2.4 | Nobody mentions the time molasses killed 21 people. | s02 grandma knitting, bubble "Slow as molasses, sweetie." -> record scratch + sepia freeze on "killed" (twist at 4.1 s) |
| 3 | 6.1 | January 15th, 1919, Boston. | s03 Commercial Street, the giant tank, "BOSTON · JAN 15, 1919" |
| 4 | 8.7 | A 50-foot steel tank holding 2.3 million gallons of molasses rips open. | s04 tank groans, sweats, rivets pop like popcorn / s05 INSERT counter 2.3 MILLION + "GALLONS" stamp / s06 panels peel, the wave erupts (flash + shake) |
| 5 | 14.4 | What comes out is a 15-foot wave moving 35 miles per hour. | s07 wave barrels down the empty street / s08 INSERT speedometer 0 -> 35 MPH |
| 6 | 19.5 | (beat) That's faster than Usain Bolt. | s09 a lane-sized molasses wave overtakes a generic cartoon sprinter: ??? -> ! + sweat (unharmed) |
| 7 | 21.3 | It flattens buildings and twists the elevated train tracks like spaghetti. | s10 empty buildings squash flat, the firehouse slides off its foundation / s11 the elevated railway wobbles into noodles (??? -> stars) |
| 8 | 25.7 | 21 people dead. 150 injured. | s12 AFTERMATH: quiet sticky street, wreckage, "21 DEAD / 150 INJURED", sad music |
| 9 | 29.1 | The company blamed anarchist bombers. | s13 court: the company's lawyer points at a cartoon anarchist with a round bomb: ??? + sweat |
| 10 | 31.5 | The court said: no. (beat) You just built a garbage tank. | s14 gavel slam on "no" (flash + shake), stamp "GARBAGE TANK", lawyer sweats |
| 11 | 34.5 | And on hot days, locals swore the neighborhood smelled like molasses for decades. | s15 modern Boston, hot day, a local walks + sweats / s16 stops, sniffs, whispers "...molasses." |
| 12 | 39.7 | Slow as molasses? (beat) Biggest lie in history. | s17 "SLOW AS MOLASSES?" over the frozen grandma -> big red X -> "BIGGEST LIE IN HISTORY" |
| 13 | 43.0 | Subscribe for more. | s18 closer (0.87 s): back on the wave rising behind the horse, hard cut -> loops into frame 1 |

## Checks
- Frame 1 = the wave already moving + hook text readable in 1 s; line 1 = 7 words; twist at 4.1 s; new visual every 1.1-3.4 s; payoff 39.7-42.8 s; closer 0.87 s; loop: s18 is the same continuous camera/wave move that s01 continues.
- Years/numbers: TTS says "nineteen nineteen", "twenty-one", "two point three million", "thirty-five", "a hundred and fifty"; Whisper (small.en) transcribes "January 15, 1919, Boston", "21", "2.3 million", "35", "150" (no "one thousand nine hundred").
- Voice: Kokoro am_fenrir, speed 0.95, Shorts gaps (0.24 s sentence / 0.10 s comma) + punchline beats (`projects/molasses-flood/make_voice.py`).
