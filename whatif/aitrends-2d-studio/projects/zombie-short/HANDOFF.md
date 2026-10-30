# HANDOFF: What If SHORT "What If You Were in a Zombie Apocalypse With Zero Experience?" (9:16 vertical, 62.7 s, YouTube Shorts)

Script: `whatif/shorts-originals/zombie/script.md` (fiction, comedy; read the header). Voice landed: `input/voiceover.wav` 62.67 s (Fenrir).
Word clock `timeline/words.json` (94% match). CAPTIONS ON (rule 23) at y 1330: keep key action out of y 1270-1400 while words are up
and out of the bottom 480 px / right 180 px (YouTube Shorts UI). Sets copied from ep 2 (apartment, street, roofs, court, devices, faces, jump...).

## Look (HORROR, owner Oct 31: "I want horror, the place needs to be dark")
Same HORROR BAR as `projects/rules-01/HANDOFF.md` (read it): cold dark palette + one practical light (the flashlight beam, moonlight
through the front glass, a freezer-room bulb), grain, vignette, slow pushes, cuts on sound, fear from what you DON'T see.
`sets/horror.js` (FX, endCard) and `sets/house.js` are copied in. HERO = mustard hoodie (ep 1 look); DEV appears only as a muffled voice
through the steel freezer door and a shadow in the light under it. Zombies are SILHOUETTES: dark shapes and hands pressed on the front
glass, a crowd you never see clearly, eyes catching the flashlight at most. No gore, no bites shown, no weapons. Hard cut to black after
"Would you open the door?" with endCard "Full What If stories on the channel." (or "Follow for part two.").

## Stage A (sets/props)
| Worker | Files | What |
|---|---|---|
| H2 | sets/zombies.js + DEMO_zombies.js | Horror zombies: `zombieSil(g, x, y, s, {t, sway, eyes:0..1})` a dark silhouette (torn edges, slumped shoulders, head tilt), `glassHorde(g, t, {n, press:0..1, hits})` silhouettes and palms pressing on a big store front window from outside in moonlight, with thuds (`hits` times) and smears of condensation (no blood), `handsOnGlass`. |
| H1 | sets/store.js + DEMO_store.js (after rules-03 batch C) | The DARK SUPERMARKET: `store(g,t,cam,{view:'front'|'aisle'|'back'|'freezer'|'door', flashlight:{x,y,ang,on}, moon})`: front glass wall with moonlight and the parking lot beyond, empty shelves, a toppled cart, the back corridor, the FREEZER ROOM (frost, hanging plastic strips, a dim cold bulb, breath fog, a steel door with NO inside handle, light and a shadow under the door), a dead phone (`deadPhone` 10% -> 0%). |

## Stage B: batches (shot list coming from the lead)
