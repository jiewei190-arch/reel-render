# Molasses Flood 1919: The Boston Tsunami That Killed 21 People (slug `molasses-flood`)

Justin clips Short, Toon 3D + BEANMEN effects, 9:16 1080x1920, 24 fps, **47.65 s** (Chatterbox D2 narrator, the owner's Nov 13 pick; no padding).
Owner's script, with the brief's own length cut applied ("knocks a firehouse off its foundation" removed from the narration;
the firehouse still slides off its foundation on screen in shot 10). Closer: "Subscribe for more." (story answered).

TONE GUARD: 21 people really died. Comedy stays on the phrase, the tank, the speed and the company's excuse. Nobody is shown
hurt or trapped; the wave only hits empty streets, buildings and the elevated railway; no horse gag (the frame-1 horse is
calm, before the hit). The aftermath (shot 12) is a quiet, dimmed beat with sad music and no FX.

## Narration (captions show digits; chatterbox_d2.py spells numbers for the TTS: `input/voice_script.md`)
| # | Time | Line | Shot |
|---|---|---|---|
| 1 | 0.0 | You've heard the phrase slow as molasses. | s01 FRAME 1: molasses wave towering over a 1919 street, horse + wagon, hook text "A MOLASSES TSUNAMI / KILLED 21 PEOPLE" |
| 2 | 2.6 | Nobody mentions the time molasses killed 21 people. | s02 grandma knitting, bubble "Slow as molasses, sweetie." -> record scratch + sepia freeze on "killed" (twist at 4.1 s) |
| 3 | 6.5 | January 15th, 1919, Boston. | s03 Commercial Street, the giant tank, "BOSTON · JAN 15, 1919" |
| 4 | 9.7 | A 50-foot steel tank holding 2.3 million gallons of molasses rips open. | s04 tank groans, sweats, rivets pop like popcorn / s05 INSERT counter 2.3 MILLION + "GALLONS" stamp / s06 panels peel, the wave erupts (flash + shake) |
| 5 | 15.3 | What comes out is a 15-foot wave moving 35 miles per hour. | s07 wave barrels down the empty street / s08 INSERT speedometer 0 -> 35 MPH |
| 6 | 19.9 | (beat) That's faster than Usain Bolt. | s09 a lane-sized molasses wave overtakes a generic cartoon sprinter: ??? -> ! + sweat (unharmed) |
| 7 | 21.9 | It flattens buildings and twists the elevated train tracks like spaghetti. | s10 empty buildings squash flat, the firehouse slides off its foundation / s11 the elevated railway wobbles into noodles (??? -> stars) |
| 8 | 26.2 | 21 people dead. 150 injured. | s12 AFTERMATH: quiet sticky street, wreckage, "21 DEAD / 150 INJURED", sad music |
| 9 | 29.3 | The company blamed anarchist bombers. | s13 court: the company's lawyer points at a cartoon anarchist with a round bomb: ??? + sweat |
| 10 | 31.5 | The court said: no. (beat) You just built a garbage tank. | s14 gavel slam on "no" (flash + shake), stamp "GARBAGE TANK", lawyer sweats |
| 11 | 36.3 | And on hot days, locals swore the neighborhood smelled like molasses for decades. | s15 modern Boston, hot day, a local walks + sweats / s16 stops, sniffs, whispers "...molasses." |
| 12 | 42.3 | Slow as molasses? (beat) Biggest lie in history. | s17 "SLOW AS MOLASSES?" over the frozen grandma -> big red X -> "BIGGEST LIE IN HISTORY" |
| 13 | 46.5 | Subscribe for more. | s18 closer (1.25 s): back on the wave rising behind the horse, hard cut -> loops into frame 1 |

## Checks
- Frame 1 = the wave already moving + hook text readable in 1 s; line 1 = 7 words; twist at 4.5 s; new visual every 0.9-4.3 s; payoff 42.3-46.4 s; closer 1.25 s; loop: s18 is the same continuous camera/wave move that s01 continues.
- Years/numbers: TTS says "nineteen nineteen", "twenty-one", "two point three million", "thirty-five", "one hundred fifty"; Whisper (small.en) transcribes "January 15th, 1919, Boston", "21", "2.3 million", "35", "150" (no "one thousand nine hundred").
- Voice (Nov 13 re-voice): Chatterbox D2 (`whatif/voice/chatterbox_d2.py`, built-in voice, no cloning), `--gap 0.3 --lead 0.15`, "..." beats before the punchlines ("rips open", "That's faster", "You just built", "Biggest lie"). Whisper QA matched every line (`input/voiceover.lines.json`). Line 11 is written "Biggest lie, in history." for the TTS only: without the comma all 3 seeds were heard as "lion history". The words are unchanged. Edits after TTS: +0.6 s of silence after "150 injured." (the respectful beat before the courtroom) and 0.34 s of trailing silence trimmed after the closer (tighter loop). The old Fenrir voice (`make_voice.py`) is kept for reference.
