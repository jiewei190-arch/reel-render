# HANDOFF: THE RULES #3 "The Alert" (apocalyptic horror short, 9:16 vertical, 66.5 s, Instagram Reels)

Script: `horror/rules-03/script.md` (read the header). Voice landed: `input/voiceover.wav` 66.51 s: Fenrir narrator, [MOM] line 8 (muffled
through the front door, too slow, too calm), [VOICE] line 12 ("Five." a dry close whisper from the dark). Word clock: `timeline/words.json`
(91% match; the planner re-times it from the audio). CAPTIONS ARE ON (config.json, rule 23) at y 1330: keep key action out of y 1270-1400
while words are up, and out of the bottom 480 px / right 180 px.

The owner's PC is OFF for this one: every batch is done by the cloud workers, and the lead renders the final in the cloud.

Same kit and HORROR BAR as `projects/rules-01/HANDOFF.md`. Reuse `sets/horror.js` (grain, vignette, coldGrade, flicker, breathe,
interference, endCard "Follow for the next rule.") and `sets/house.js` from #1 where it fits (stairs, hallway, front door).
APOCALYPSE LOOK: the outside light is the monster. It is never seen directly: a white-warm (#fff3d6 -> #ffd9a0) glow under the door,
blades of light through gaps in the taped cardboard, dust motes in it, the light slowly creeping across the floor. Inside is cold blue dark.
The street is dead quiet: no birds, no cars. Every phone on the street lighting up at once is the opening image.

## Cast (cast.js)
- HERO "you": teen, DARK RED hoodie, short dark hair (faces.js giantFace HERO now draws the hair; actor() draws hair from cast.hair).
- BROTHER: little brother, kid scale, asleep on the couch under a blanket (actor('BROTHER', ...)). Never wakes.
- MOM and DAD: only two closed bedroom doors upstairs. The thing at the door is NEVER shown (a shadow breaking the light under the door,
  the doorknob not turning). The fifth one is NEVER shown: the last shot is "you" counting on your fingers in the dark, the whisper comes
  from the black beside you.

## Stage A (now): new sets/props
| Worker | Files | What |
|---|---|---|
| H1 | sets/home4.js + DEMO_home4.js | The family house, vertical framing: `home4(g,t,cam,{view:'street'|'living'|'door'|'window'|'stairs'|'upstairs', glow:0..1, boarded:0..1})`. Street exterior at 3 a.m. (row of houses, every window lighting up blue from phones at once, a dead streetlight, no cars). Living room (couch with the sleeping brother under a blanket, TV off, coffee table, the front door with light under it, a shoe rack), windows getting taped cardboard (boarded 0..1, tape strips, gaps that leak light), the stairs up to two closed bedroom doors (MOM / DAD by the door decor, never people). The light: `outsideLight(g, t, {under:0..1, gaps:0..1, creep:0..1})` draws the glow under the door/gaps + dust motes; a shadow can break it (`shadow` 0..1). |
| H2 | sets/rules3.js + DEMO_rules3.js | Props + UI: `alertPhone(g,x,y,s,{t, rules:0..3, buzz})` a phone with a full-screen generic EMERGENCY ALERT (red/black banner, the 3 rules appearing one by one; a 2nd alert "Rule 4" style isn't needed), `phonesWindow` (many small phone glows in house windows at once), `tapeRoll` + `cardboard(g,...,{gaps})`, `doorKnob(g,...,{turn})`, `fingerCount(g, t, n)` a hand counting 1-4 on fingers in the dark with soft rim light, `alertSound` timing helper for the scream (sfx cues). Generic alert only: no real agency names or logos. |

Push to your own branch, write a status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot batches next:
A -> H3, B -> H4, C (the knock, the count, "Five.") -> H1 after its set is done.
