# HANDOFF: What If SHORT "What If You Were in a Zombie Apocalypse With Zero Experience?" (9:16 vertical, 62.7 s, YouTube Shorts)

Script: `whatif/shorts-originals/zombie/script.md` (fiction, comedy; read the header). Voice landed: `input/voiceover.wav` 62.67 s (Fenrir).
Word clock `timeline/words.json` (94% match). CAPTIONS ON (rule 23) at y 1330: keep key action out of y 1270-1400 while words are up
and out of the bottom 480 px / right 180 px (YouTube Shorts UI). Sets copied from ep 2 (apartment, street, roofs, court, devices, faces, jump...).

## Look
Bright cartoon comedy, NOT horror: dusk orange/teal palette, overgrown hometown, goofy slow zombies (green-grey skin, torn clothes, arms out,
droopy eyes, tongue out, groaning), no gore, no bites, no weapons, no fighting. Cast: HERO = ep 1 look (mustard hoodie), MINA (red
scarf, kid), DEV (orange beanie), BISCUIT. Short-form pacing: a new visual every 1.5-2.5 s, punch-ins on jokes, big expressive faces.

## Stage A (sets/props)
| Worker | Files | What |
|---|---|---|
| H2 | sets/zombies.js + DEMO_zombies.js | `zombie(g, x, y, s, {t, walk, look, sniff:0..1, happy:0..1, variant:0..5, tip})`: goofy cartoon zombie on the rig (shuffle walk, arms out, head loll, groan mouth), 6 colour/outfit variants (office shirt, tracksuit, chef, granny, kid in a cap, delivery uniform), a crowd helper `horde(g, t, {n, spread, turn:0..1})` for 40 heads turning at once; a `sniff` pose (noses up, eyes closed, little smell-wavy lines), `happy` (holding fries), and a shoe-tip gag prop (`shoeTip`). Plus `scooter(g, ...)` a delivery scooter with a food box, `takeoutBag`, `fries`, a phone with a delivery app ("ORDER ARRIVING", 5-star rating), a beanbag barricade. |
| H1 | (after rules-03 batch C) nothing extra; shots use street.js / apartment.js / roofs.js |

## Stage B: batches (shot list coming from the lead)
