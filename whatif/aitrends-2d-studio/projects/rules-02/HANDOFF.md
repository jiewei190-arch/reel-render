# HANDOFF: THE RULES #2 "The Night Shift" (horror short, 9:16 vertical, 69.9 s, Instagram Reels)

Script: `horror/rules-02/script.md`. Voice landed: `input/voiceover.wav` 69.86 s: Fenrir narrator, [MAN] (line 7, low/slow/pitched down)
and [PHONE] (line 10, landline). Word clock: `timeline/words.json` (88% match; check the filtered character lines against sentences.json /
the audio). CAPTIONS ARE ON (config.json, owner rule 23): burned-in at y 1330, so keep important action out of y 1270-1400 when a caption
is up, and out of the bottom 480 px / right 180 px (IG UI).

Same kit, same HORROR BAR as `projects/rules-01/HANDOFF.md` (read it): cold palette + one warm practical, grain, vignette, slow pushes,
fear from what you DON'T see, cuts on sound, hard cut to black at the end. `sets/horror.js` from #1 is here (grain, vignette, coldGrade,
flicker, breathe, interference, ruleTitle, endCard): REUSE it. End card text: "Follow for the next rule."

## Cast (cast.js)
- HERO "you": the new night clerk, DARK GREEN work polo with a white name tag, short hair. Never lip-synced.
- STRANGER: tall thin figure in a long dark coat (outfit STRANGER, draw ~1.15x), face never lit; only a too-wide pale smile catching the
  light; never blinks. Never fully shown in the final shot: the thing behind "you" on camera four is just a tall dark shape + that smile.
- Biscuit doesn't appear (different location).

## Stage A (now): new sets
| Worker | Files | What |
|---|---|---|
| H1 | sets/gas.js + DEMO_gas.js | The QUIK STOP gas station at night, vertical framing: `gas(g,t,cam,{view:'exterior'|'counter'|'window'|'door'|'aisle'|'behind', lights, flicker})`. Exterior: canopy with buzzing lights, 2 pumps, an empty highway into pitch black, a tall price sign, moths. Interior: the counter with a register (the sticky note on it), the night pay window with a pass-through drawer and a speaker grille, the front door with a deadbolt + "OPEN 24 HRS" sign, snack aisles, a coffee machine, fluorescent tubes (one flickering), a wall clock (2:00 / 2:40 / 3:00), the wall phone. 'behind' = the counter seen from behind the clerk (for camera four's angle). |
| H2 | sets/rules2.js + DEMO_rules2.js | Props + UI: `stickyNote(g,x,y,s,{rules:n})` (yellow note, 3 handwritten rules appear one by one), `cctv(g,x,y,w,h,{cams:4, focus:0..4, static, time:'03:00:12'})` (a 2x2 grid of grainy green-grey feeds labelled CAM 1-4 with a REC dot + timestamp; CAM 4 can fill the screen), `wallPhone(g,x,y,s,{ring:0..1, offHook})` (ringing shake + coiled cord), `stranger(g,x,y,s,{smile:0..1, lit:0..1, tap:0..1})` (the coat silhouette, the too-wide smile, a knuckle tap on glass), glass reflections/condensation for the pay window. |

Push to your own branch, write a status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot batches next.
